/*
	This version of sneak attack takes into consideration subclass features:
		* Rakish Audacity
		* Insightful Fighting
		* Versatile Sneak Attack feat

	Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an
	extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use
	a finesse or a ranged weapon.

	You don't need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn't
	incapacitated, and you don't have disadvantage on the attack roll.

	The amount of the extra damage increases as you gain levels in this class, as shown in the Sneak Attack column of the Rogue table.
*/
const version = "11.0";
const optionName = "Sneak Attack";
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
	const lastArg = args[args.length - 1];

	// Check the attack type
	if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
		console.debug(`${optionName} - not valid action type`);
		return {};
	}

	let weaponAllowed = lastArg.itemData.system.properties?.fin;
	let versatile = checkVersatileSneakAttack(token);
	if (versatile) {
		weaponAllowed = lastArg.itemData.system.proficient;
	}

	if (lastArg.itemData.system.actionType === "mwak" && !weaponAllowed) {
		console.debug(`${optionName} - non-finesse melee attack`);
		return {};
	}

	// check for rogue levels
	const rogueLevels = actor.getRollData().classes?.rogue?.levels;
	if (!rogueLevels) {
		console.debug(`${optionName} - no rogue levels`);
		return {};
	}

	let targetToken = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
	if (!targetToken) {
		console.error(`${optionName} - no target token`);
		return {};
	}

	// check once per turn
	if (isAvailableThisTurn(actor) && game.combat) {
		// Determine if the attack is eligible for Sneak Attack
		let isSneak = lastArg.advantage;

		if (!isSneak && checkAllyNearTarget(token, targetToken)) {
			// adjacent enemy
			isSneak = !lastArg.disadvantage;
		}

		if (!isSneak && !lastArg.disadvantage) {
			isSneak = checkRakishAudacity(token, targetToken);
		}

		if (!isSneak && !lastArg.disadvantage) {
			isSneak = checkInsightfulFighting(token, targetToken);
		}

		if (!isSneak) {
			console.debug(`${optionName} - attack not eligible for sneak attack`);
			return {};
		}

		// ask if they want to apply sneak attack
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Use Sneak attack?</p>`,
				buttons: {
					one: {
						icon: '<i class="fas fa-check"></i>',
						label: "Confirm",
						callback: () => resolve(true)
					},
					two: {
						icon: '<i class="fas fa-times"></i>',
						label: "Cancel",
						callback: () => {resolve(false)}
					}
				},
				default: "two"
			}).render(true)
		});
		useSneak = await dialog;

		// Apply the damage
		if (useSneak) {
			await actor.setFlag('midi-qol', 'sneakAttackTime', `${combatTime}`);
			const diceMult = lastArg.isCritical ? 2: 1;
			const baseDice = Math.ceil(rogueLevels/2);
			const diceCount = baseDice * diceMult;
			return {damageRoll: `${diceCount}d6`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// Check if there is an enemy of the target adjacent to it
function checkAllyNearTarget(rogueToken, targetToken) {
	let allNearby = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, targetToken, 5);
	let nearbyFriendlies = allNearby.filter(i => (i !== rogueToken));
	allNearby = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.NEUTRAL, targetToken, 5);
	let nearbyNeutrals = allNearby.filter(i => (i !== rogueToken));

	return ((nearbyFriendlies.length > 0) || (nearbyNeutrals.length > 0));
}

function checkRakishAudacity(rogueToken, targetToken) {
	let featureItem = rogueToken.actor.items.getName("Rakish Audacity");
	let rakish = false;
	if (featureItem) {
		let totalNearbyToMe = MidiQOL.findNearby(null, rogueToken, 5).length;
		let distanceToTarget = MidiQOL.getDistance(targetToken, rogueToken, false);
		rakish = ((totalNearbyToMe === 1) && (distanceToTarget <= 5));
	}

	return rakish;
}

function checkInsightfulFighting(rogueToken, targetToken) {
	const effect = findEffect(rogueToken.actor, "Insightful Fighting", rogueToken.actor.uuid);
	if (effect)
		return true;
	return false;
}

function checkVersatileSneakAttack(rogueToken) {
	const effect = findEffect(rogueToken.actor, "Versatile Sneak Attack", rogueToken.actor.uuid);
	if (effect)
		return true;
	return false;
}

function isAvailableThisTurn(actor) {
	if (game.combat) {
		const lastTime = actor.getFlag("midi-qol", "sneakAttackTime");
		if (combatTime === lastTime) {
			return false;
		}

		return true;
	}

	return false;
}

function findEffect(actor, effectName, origin) {
    let effectUuid = null;
    effectUuid = actor?.effects?.find(ef => ef.name === effectName && ef.origin === origin);
    return effectUuid;
}
