/*
	At 8th level, you gain the ability to infuse your weapon strikes with the fiery power of the forge. Once on each of
	your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 fire damage
	to the target. When you reach 14th level, the extra damage increases to 2d8.
*/
const version = "12.3.0";
const optionName = "Divine Strike (Nature Domain)";
const timeFlag = "divineStrikeTime";

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
			return {};
		}

		const damageDie = actor.system.scale.cleric['divine-strike-damage-dice'].die;
		let dieCount = actor.system.scale.cleric['divine-strike-damage-dice'].number;

		// ask if they want to use the option
		let damageType = game.i18n.localize("cold");
		let content = `
			  <p>Use ${optionName} on this attack?</p>
			  <sub>(target takes an additional ${dieCount}${damageDie} ${damageType} damage)</sub>
			  <p>Select the damage type:</p>
			  <div style="margin: 10px;">
				  <select name="dt">
					<option value="cold">Cold</option>
					<option value="fire">Fire</option>
					<option value="lightning">Lightning</option>
				  </select>
			  </div>`;

		const useFeature = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: content,
			yes: {
				callback: (event, button, dialog) => {
					damageType = game.i18n.localize(button.form.elements.dt.value);
				}
			},
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
