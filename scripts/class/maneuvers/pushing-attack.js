const optionName = "Pushing Attack";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            if (HomebrewHelpers.isLargeOrSmaller(targetToken)) {
                await HomebrewMacros.pushTarget(token, targetToken, 3);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
