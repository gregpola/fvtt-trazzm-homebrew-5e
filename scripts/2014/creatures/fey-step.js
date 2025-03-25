const version = "12.3.0";
const optionName = "Fey Step";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = item.system.range.value ?? 30;
		await HomebrewMacros.teleportToken(token, maxRange);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
