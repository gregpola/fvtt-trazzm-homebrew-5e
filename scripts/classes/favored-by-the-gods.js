/*
	Starting at 1st level, divine power guards your destiny. If you fail a saving throw or miss with an attack roll, you
	can roll 2d4 and add it to the total, possibly changing the outcome. Once you use this feature, you can’t use it
	again until you finish a short or long rest.
 */
const version = "11.0";
const optionName = "Favored by the Gods";

try {
	const available = item.system.uses.value; //check for available uses
	if(!available)
		return {};

	if (args[0].macroPass === "preCheckHits") {	
		let attackTotal = workflow.attackTotal;
		let target = workflow.targets.first();
		let targetAC = target.actor.system.attributes.ac.value;
		let changed = Number(attackTotal) + 8; // 8 is max roll

		if((targetAC > attackTotal) && (changed >= targetAC)) {
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					// localize this text
					title: `${optionName}`,
					content: `<p>Your attack misses with a ${attackTotal}, do you want to apply ${optionName} to it? (+2d4)</p>`,
					buttons: {
						one: {
							icon: '<p> </p><img src = "icons/magic/symbols/runes-star-pentagon-blue.webp" width="50" height="50"></>',
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
				let attackRoll = new Roll(`${attackTotal} + 2d4`).roll({async:false});
				workflow.setAttackRoll(attackRoll);
				return await item.update({"system.uses.value": available - 1});
			}
		}
	}
	else if (args[0].macroPass === "preCheckSaves") {
		console.log("preCheckSaves"); // not sure how to handle this
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
