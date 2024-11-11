/*
	Once per turn, when you cast a cantrip that uses the increased ability score, you can add your ability modifier to the damage you deal.
 */
const version = "12.3.0";
const optionName = "Empowered Cantrips";
const timeFlag = "empoweredCantripsTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		// make sure the trigger is a spell
		if (!["msak", "rsak"].includes(item.system.actionType)) {
			console.log(`${optionName}: not a spell`);
			return {};
		}

		// make sure it is a cantrip
		let isCantrip = false;
		const spellLevel = workflow.castData?.castLevel ?? undefined;
		if (spellLevel === 0) {
			isCantrip = true;
		}

		if (!isCantrip) {
			let flag = item.getFlag(_flagGroup, 'spell-level');
			if (flag === 0) {
				isCantrip = true;
			}
		}

		if (!isCantrip) {
			console.log(`${optionName}: not a cantrip`);
			return {};
		}

		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
			console.log(`${optionName}: is not available for this casting`);
			return;
		}

		// ask if they want to use the option
		let useFeature = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Apply ${optionName} to this casting?</p><p>Once per turn, when you cast a cantrip that uses the increased ability score, you can add your ability modifier to the damage you deal.</p>`,
			rejectClose: false,
			modal: true
		});

		if (useFeature) {
			await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

			// add damage bonus
			const ability = actor.system.attributes.spellcasting;
			const abilityBonus = actor.system.abilities[ability].mod;
			let damageType = workflow.item.system.damage.parts[0][1];
			return {damageRoll: `${abilityBonus}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
