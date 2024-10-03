/*
	Starting at 2nd level, you can use your Channel Divinity to wield the power of the storm with unchecked ferocity.

	When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.
*/
const version = "12.3.0";
const optionName = "Destructive Wrath"
const validTypes = ["lightning", "thunder"];

try {
	if (args[0].macroPass === "DamageBonus") {
		// check the damage type
		if (!workflow.damageRolls.filter(i => validTypes.includes(i.options.type))) {
			console.log(`${optionName} - not an appropriate damage type`);
			return {};
		}

		// Ask if they want to use it
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Channel Divinity: ${optionName}`,
				content: `<p>Use to maximize the ${item.name} damage?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/lightning/bolt-strike-blue-white.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			await Promise.all(workflow.damageRolls.map(async (damageRoll, i, arr) => {
				if (validTypes.includes(damageRoll.options.type)) arr[i] = await damageRoll.reroll({maximize: true});
			}));
			workflow.setDamageRolls(workflow.damageRolls);
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
