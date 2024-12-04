/*
	At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage to the target. When you reach 14th level, the extra damage increases to 2d8.
*/
const version = "12.3.0";
const optionName = "Divine Strike (Life Domain)";
const timeFlag = "divineStrikeLifeDomain";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
			console.log(`${optionName}: is not available this turn`);
			return;
		}

		// ask if they want to use the option
		const useFeature = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Apply ${optionName} damage bonus to this attack?</p><p>(once per turn)</p>`,
			rejectClose: false,
			modal: true
		});

		if (useFeature) {
			await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

			// add damage bonus
			const clericLevel = actor.classes.cleric?.system.levels ?? 0;
			const damageType = game.i18n.localize("radiant");
			const levelMulti = clericLevel > 13 ? 2 : 1;
			const critMulti = lastArg.isCritical ? 2: 1;
			const totalDice = levelMulti * critMulti;
			return {damageRoll: `${totalDice}d8[${damageType}]`, flavor: optionName};
		}
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
