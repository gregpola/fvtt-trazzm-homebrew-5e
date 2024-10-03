const version = "12.3.0";
const optionName = "Fey Step (Spring)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let targetToken = token;
		let target = workflow.targets.first();

		if (target) {
			targetToken = target;
		}

		// transport the target
		const maxRange = item.system.range.value ?? 30;
		await HomebrewMacros.teleportToken(targetToken, maxRange);
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
