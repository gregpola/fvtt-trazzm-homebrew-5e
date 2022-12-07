const version = "0.1.0";
const optionName = "Favored by the Gods";

try {
	//let workflow = await MidiQOL.Workflow.getWorkflow(args[0].uuid);
	const feature = token.actor.items.getName(optionName);
	const available = feature.data.data.uses.value; //check for available uses
	if(!available)
		return {};

	if (args[0].macroPass === "preCheckHits") {	
		let attackTotal = this.attackTotal;
		let target = Array.from(this.targets)[0].actor;
		let targetAC = target.getRollData().attributes.ac.value;
		let changed = Number(attackTotal) + 8; // 8 is max roll

		if((targetAC > attackTotal) && (changed >= targetAC)) {
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					// localize this text
					title: `${optionName}`,
					content: `<p>Your attack misses with a ${attackTotal}, do you want to apply ${optionName} to it?</p>`,
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
				this.setAttackRoll(attackRoll);
				return await feature.update({"data.uses.value": available - 1});
			}
		}
	}
	else if (args[0].macroPass === "postSave") {
		console.log("postSave"); // not sure how to handle this
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
	