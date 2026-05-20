const optionName = "Gust of Wind";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewMacros.pushTarget(token, targetToken, 3);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
