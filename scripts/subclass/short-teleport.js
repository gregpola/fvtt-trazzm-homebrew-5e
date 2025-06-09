const version = "12.4.0";
const optionName = "Shadowy Dodge";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const maxRange = rolledActivity.range.value ?? 30;
        await HomebrewMacros.teleportToken(token, maxRange);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
