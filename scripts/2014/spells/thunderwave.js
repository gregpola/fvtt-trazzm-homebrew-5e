const version = "12.3.0";
const optionName = "Thunderwave";

try {
	if (args[0].macroPass === "postActiveEffects") {
		for (let target of workflow.failedSaves) {
			await HomebrewMacros.pushTarget(token, target, 2);
		}
	}
} catch (err) {
    console.error(`${optionName} push ${version}`, err);
}
