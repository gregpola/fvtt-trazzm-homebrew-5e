const version = "10.0.1";
const optionName = "Metallic Breath Weapon - Repulsion";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let pusher = canvas.tokens.get(args[0].tokenId);
		let targets = args[0].failedSaves;
		if (targets && targets.length > 0) {
			for (let target of targets) {
				await HomebrewMacros.pushTarget(pusher, target.object, 4);
				await PushToken(pusher, target);
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
