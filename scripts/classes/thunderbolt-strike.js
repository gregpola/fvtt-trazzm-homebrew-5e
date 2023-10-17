/*
	At 6th level, when you deal lightning damage to a Large or smaller creature, you can also push it up to 10 feet away from you.
*/
const version = "10.0.1";
const optionName = "Thunderbolt Strike";

try {
	if (args[0].macroPass === "DamageBonus") {	
		const lastArg = args[args.length - 1];
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// check the damage type
		if (lastArg.workflow.damageDetail.filter(i=>i.type === "lightning").length < 1) {
			console.log(`${optionName} - not lightning damage`);
			return {};
		}
			
		// check the target's size, must be Large or smaller
		const tsize = targetActor.system.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			console.log(`${resourceName} - target is too large to push`);
			return {};
		}

		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Use ${optionName} to push the target?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/lightning/fist-unarmed-strike-blue.webp" width="30" height="30"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			// Push the target
			await HomebrewMacros.pushTarget(actorToken, targetToken, 3);
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
