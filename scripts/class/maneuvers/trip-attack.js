const optionName = "Trip Attack";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            if (HomebrewHelpers.isLargeOrSmaller(targetToken)) {
                await targetToken.actor.toggleStatusEffect('prone', {active: true});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
