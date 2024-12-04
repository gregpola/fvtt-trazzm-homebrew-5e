const version = "12.3.0";
const optionName = "Shadow Walk";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = workflow.item.system.range.value ?? 120;
		await HomebrewMacros.teleportToken(token, maxRange);
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

