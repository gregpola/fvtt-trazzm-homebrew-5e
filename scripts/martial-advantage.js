/*
	Once per turn, the hobgoblin can deal an extra 7 (2d6) damage to a creature it hits with a weapon attack if that
	creature is within 5 feet of an ally of the hobgoblin that isn't incapacitated.
 */
const version = "11.0";
const optionName = "Martial Advantage";
const timeFlag = "martialAdvantageTime";

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		// check the action type
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: is not an applicable action type`);
			return;
		}
			
		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return;
		}
		
		let targetToken = workflow.hitTargets.first();
		if (checkAllyNearTarget(token, targetToken)) {
			const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
			const lastTime = actor.getFlag("midi-qol", timeFlag);
			if (combatTime !== lastTime) {
				await actor.setFlag("midi-qol", timeFlag, combatTime)
			}

			return {damageRoll: '2d6', flavor: `${optionName} Damage`};
		}		
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}	
	return false;
}

// Check if there is an enemy of the target adjacent to it
function checkAllyNearTarget(token, targetToken) {
	let allNearby = MidiQOL.findNearby(token.document.disposition, targetToken, 5);
	let nearbyFriendlies = allNearby.filter(i => (i !== token));
	return (nearbyFriendlies.length > 0);
}
