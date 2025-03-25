/*
	Just replace the damage type for a generic Divine Strike script
*/
const version = "12.3.0";
const optionName = "Divine Strike";
const timeFlag = "divineStrikeTime";
const damageType = game.i18n.localize("fire");

try {
	if (args[0].macroPass === "DamageBonus") {
		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
			console.log(`${optionName}: is not available this turn`);
			return;
		}

		const damageDie = actor.system.scale.cleric['divine-strike-damage-dice'].die;
		let dieCount = actor.system.scale.cleric['divine-strike-damage-dice'].number;

		// ask if they want to use the option
		const useFeature = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Use ${optionName} on this attack?</p><sub>(target takes an additional ${dieCount}${damageDie} ${damageType} damage)</sub>`,
			rejectClose: false,
			modal: true
		});

		if (useFeature) {
			await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

			// add damage bonus
			if (workflow.isCritical)
				dieCount *= 2;
			return {damageRoll: `${dieCount}${damageDie}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
