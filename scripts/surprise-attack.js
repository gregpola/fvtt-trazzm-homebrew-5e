/*
	If you hit a creature with an attack roll, the creature takes an extra 2d6 damage if it hasn’t taken a turn yet in the current combat.

*/
const version = "11.0";
const optionName = "Surprise Attack";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "DamageBonus") {
		let itemData = lastArg.itemData;
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// skip if it isn't round 1
		if (game.combat.round !== 1) {
			console.log(`${optionName} - not round 1 of combat`);
			return {};
		}

		// Skip if the action isn't an attack roll
		if (!["mwak", "rwak","msak", "rsak"].includes(itemData.system.actionType)) {
			console.log(`${optionName} - action type isn't applicable`);
			return {};
		}

		const actorTurn = game.combat.turns.findIndex(t => t.tokenId === lastArg.tokenId);
		const targetTurn = game.combat.turns.findIndex(t => t.tokenId === targetToken.id);
		const currentTurn = game.combat.turn;
		
		if ((actorTurn < targetTurn) && (targetTurn > currentTurn)) {
			const diceCount = lastArg.isCritical ? 4: 2;
			return {damageRoll: `${diceCount}d8[${lastArg.defaultDamageType}]`, flavor: optionName};
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
