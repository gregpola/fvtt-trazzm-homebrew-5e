const version = "10.0.0";
const optionName = "Martial Advantage";
const timeFlag = "martialAdvantageTime";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "DamageBonus") {
		// check the action type
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: is not an applicable action type`);
			return;
		}
			
		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return;
		}
		
		let targetToken = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
		if (checkAllyNearTarget(actorToken, targetToken)) {
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
function checkAllyNearTarget(actorToken, targetToken) {
	let foundEnemy = false;
	let nearbyEnemy = canvas.tokens.placeables.filter(t => {
		let nearby = (t.actor &&
			 t.actor?.id !== actorToken.actor._id && // not me
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
