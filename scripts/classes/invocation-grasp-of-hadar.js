const version = "11.0";
const optionName = "Grasp of Hadar";

try {
	if (args[0].macroPass === "DamageBonus") {
		const token = canvas.tokens.get(args[0].tokenId);
		const target = workflow.hitTargets.first();

		if (!target) {
			return {};
		}
		
		// make sure it's an allowed attack
		if (workflow.item.name !== "Eldritch Blast" && workflow.item.name !== "Eldritch Blast Beam") {
			console.log(`${optionName}: not Eldricth Blast`);
			return {};
		}
		
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Eldritch Invocation: ${optionName}`,
				content: `<p>Use ${optionName} to pull ${target.name} 10 feet towards you?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/creatures/claws/claw-talons-yellow-red.webp" width="50" height="50"></>',
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
		
		let useManeuver = await dialog;
		if (useManeuver) {
			await HomebrewMacros.pullTarget(token, target, 2);
		}
		
	}

	return {};
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
