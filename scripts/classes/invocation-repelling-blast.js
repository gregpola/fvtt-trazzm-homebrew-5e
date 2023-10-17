const version = "10.0.1";
const optionName = "Repelling Blast";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const attacker = canvas.tokens.get(args[0].tokenId);
		let ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
		
		// make sure it's an allowed attack
		if (lastArg.item.name !== "Eldritch Blast") {
			console.log(`${optionName}: not Eldricth Blast`);
			return {};
		}
		
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Eldritch Invocation: ${optionName}`,
				content: `<p>Use ${optionName} to push ${ttoken.name} 10 feet?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/sonic/projectile-shock-wave-blue.webp" width="30" height="30"></>',
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
		
		let useManeuver = await dialog;
		if (useManeuver) {
			await HomebrewMacros.pushTarget(attacker, ttoken, 2);
		}
		
	}

	return {};
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
