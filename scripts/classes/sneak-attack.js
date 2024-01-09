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
const version = "11.3";
const optionName = "Sneak Attack";
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
	// Check the attack type
	if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
		console.warn(`${optionName} - not valid action type`);
		return {};
	}

	if (!workflow.item.system.prof.hasProficiency) {
		console.warn(`${optionName} - ${actor.name} is not proficient with ${workflow.item.name}`);
		return {};
	}

	// check attack type for applicability
	let allowedWeapon = true;
	if (workflow.item.system.actionType === "mwak") {
		if (!workflow.item.system.properties.fin) {
			allowedWeapon = false;
			if (workflow.item.system.properties.ver && checkVersatileSneakAttack(token)) {
				allowedWeapon = true;
			}
		}
	}

	if (!allowedWeapon) {
		console.debug(`${optionName} - ${workflow.item.name} is not an allowed weapon`);
		return {};
	}

	// check for rogue levels
	let rogueLevels = actor.getRollData().classes?.rogue?.levels;
	if (actor.type === "npc")
		rogueLevels = actor.system.details.cr;

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
		let isSneak = workflow.advantage;

		if (!isSneak && checkAllyNearTarget(token, targetToken)) {
			// adjacent enemy
			isSneak = !workflow.disadvantage;
		}

		if (!isSneak && !workflow.disadvantage) {
			isSneak = checkRakishAudacity(token, targetToken);
		}

		if (!isSneak && !workflow.disadvantage) {
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
			const diceCount = Math.ceil(rogueLevels/2);
			if (workflow.isCritical) {
				const critBonus = diceCount * 6;
				return {damageRoll: `${diceCount}d6 + ${critBonus}`, flavor: optionName};
			}
			else
				return {damageRoll: `${diceCount}d6`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// Check if there is an enemy of the target adjacent to it
function checkAllyNearTarget(rogueToken, targetToken) {
	let foundEnemy = false;
	let nearbyEnemy = canvas.tokens.placeables.filter(t => {
		let nearby = (t.actor &&
			t.actor?.id !== rogueToken.actor._id && // not me
			t.id !== targetToken.id && // not the target
			t.actor?.system.attributes?.hp?.value > 0 && // not incapacitated
			t.document.disposition !== targetToken.document.disposition && // not an ally
			MidiQOL.getDistance(t, targetToken, false) <= 5 // close to the target
		);
		foundEnemy = foundEnemy || (nearby && t.document.disposition === -targetToken.document.disposition)
		return nearby;
	});
	return (nearbyEnemy.length > 0);
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
