/*
	This version of sneak attack takes into consideration subclass features:
		* Rakish Audacity
		* Insightful Fighting

	Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon.

	You don't need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn't incapacitated, and you don't have disadvantage on the attack roll.

	The amount of the extra damage increases as you gain levels in this class, as shown in the Sneak Attack column of the Rogue table.		
*/
const version = "10.1.0";
const optionName = "Sneak Attack";
const lastArg = args[args.length - 1];
const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;

try {
	if (lastArg.macroPass === "DamageBonus") {
		// Check the attack type
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.debug(`${optionName} - not valid action type`);
			return {};
		}
		
		if (lastArg.itemData.system.actionType === "mwak" && !lastArg.itemData.system.properties?.fin) {
			console.debug(`${optionName} - non-finesse melee attack`);
			return {};
		}
				
		// check for rogue levels
		let rogueToken = canvas.tokens.get(lastArg.tokenId);
		const rogueLevels = rogueToken.actor.getRollData().classes.rogue?.levels;
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
		if (isAvailableThisTurn(rogueToken.actor) && game.combat) {
			// Determine if the attack is eligible for Sneak Attack
			let isSneak = lastArg.advantage;
			
			if (!isSneak && checkAllyNearTarget(rogueToken, targetToken)) {
				// adjacent enemy
				isSneak = !lastArg.disadvantage;
			}
			
			if (!isSneak && !lastArg.disadvantage) {
				isSneak = checkRakishAudacity(rogueToken, targetToken);
			}
			
			if (!isSneak && !lastArg.disadvantage) {
				isSneak = checkInsightfulFighting(rogueToken, targetToken);
			}

			if (!isSneak) {
				console.debug(`${optionName} - attack not eligible for sneak attack`);
				return {};
			}
			
			// check auto-sneak setting
			let useSneak = getProperty(actor.data, "flags.dae.autoSneak");
			if (!useSneak) {
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
			}
			
			// Apply the damage
			if (useSneak) {
				await rogueToken.actor.setFlag('midi-qol', 'sneakAttackTime', `${combatTime}`);
				const diceMult = lastArg.isCritical ? 2: 1;
				const baseDice = Math.ceil(rogueLevels/2);
				// TODO add in any bonus dice from features
				return {damageRoll: `${baseDice * diceMult}d6`, flavor: optionName};
			}
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
		foundEnemy = foundEnemy || (nearby && t.document.disposition === -targetToken.document.disposition);
		return nearby;
	});
	
	foundEnemy = nearbyEnemy.length > 0;
	return foundEnemy;
}

function checkRakishAudacity(rogueToken, targetToken) {
	let featureItem = rogueToken.actor.items.getName("Rakish Audacity");
	let rakish = false;
	if (featureItem) {
		let totalNearbyToMe = MidiQOL.findNearby(null, rogueToken, 5, 9).length;
		let distanceToTarget = MidiQOL.getDistance(targetToken, rogueToken, false);
		rakish = ((totalNearbyToMe === 1) && (distanceToTarget <= 5));
	}
	
	return rakish;
}

function checkInsightfulFighting(rogueToken, targetToken) {
	const effect = findEffect(targetToken.actor, "Insightful Fighting", rogueToken.actor.uuid);
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
    effectUuid = actor?.effects?.find(ef => ef.label === effectName && ef.origin === origin);
    return effectUuid;
}
