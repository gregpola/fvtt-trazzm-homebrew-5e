/*
	If you hit a creature with an attack roll, the creature takes an extra 2d6 damage if it hasn’t taken a turn yet in the current combat.
*/
const version = "12.3.0";
const optionName = "Surprise Attack";

try {
	// skip if it isn't round 1
	if (game?.combat?.round !== 1) {
		console.log(`${optionName} - not round 1 of combat`);
		return {};
	}

	if (args[0].macroPass === "DamageBonus") {
		let targetToken = workflow?.hitTargets?.first();
		if (targetToken) {
			// Skip if the action isn't an attack roll
			if (!["mwak", "rwak","msak", "rsak"].includes(item.system.actionType)) {
				console.log(`${optionName} - action type isn't applicable`);
				return {};
			}

			const actorTurn = game.combat.turns.findIndex(t => t.tokenId === token.id);
			const targetTurn = game.combat.turns.findIndex(t => t.tokenId === targetToken.id);
			const currentTurn = game.combat.turn;

			if ((actorTurn < targetTurn) && (targetTurn > currentTurn)) {
				const diceCount = workflow.isCritical ? 4: 2;
				return {damageRoll: `${diceCount}d8[${workflow.defaultDamageType}]`, flavor: optionName};
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
