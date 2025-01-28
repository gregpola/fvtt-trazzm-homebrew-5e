/*
	Starting at 2nd level, you can use your Channel Divinity to wield the power of the storm with unchecked ferocity.

	When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.
*/
const version = "12.3.1";
const optionName = "Destructive Wrath"
const validTypes = ['lightning', 'thunder'];
const channelDivinityName = "Channel Divinity (Cleric)";

try {
	if (args[0].macroPass === "DamageBonus") {
		// check the damage type
		const isEligibleType = workflow.damageRolls.filter(i => validTypes.includes(i.options.type));
		if (!isEligibleType || (isEligibleType.length === 0)) {
			console.log(`${optionName} - not an appropriate damage type`);
			return {};
		}

		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		let usesLeft = channelDivinity?.system.uses?.value ?? 0;
		if (!channelDivinity || !usesLeft) {
			console.log(`${optionName} - no ${channelDivinityName} feature or no uses remaining`);
			return {};
		}

		const proceed = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Apply ${optionName} to this attack?</p><sub>Costs 1 Channel Divinity use and maximizes lightning and thunder damage</sub>`,
			rejectClose: false,
			modal: true
		});

		if (proceed) {
			await Promise.all(workflow.damageRolls.map(async (damageRoll, i, arr) => {
				if (validTypes.includes(damageRoll.options.type)) arr[i] = await damageRoll.reroll({maximize: true});
			}));
			workflow.setDamageRolls(workflow.damageRolls);

			await channelDivinity.update({"system.uses.value": usesLeft - 1});
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
