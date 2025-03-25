const version = "12.3.0"
const optionName = "Slayer";
const timeFlag = "slayer-time";

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		const targetToken = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} - not an eligible attack`);
			return;
		}

		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
			console.log(`${optionName} - not available this attack`);
			return;
		}

		// make sure the target is below max HP
		const hpValue = actor.system.attributes.hp.value;
		const hpMax = actor.system.attributes.hp.max;
		if (hpValue >= hpMax) {
			console.log(`${optionName} - not available, target has max HP`);
			return;
		}

		await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
		const diceMult = workflow.isCritical ? 2: 1;
		return {damageRoll: `${diceMult}d8[psychic]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
