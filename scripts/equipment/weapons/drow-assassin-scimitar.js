const version = "12.4.0";
const optionName = "Drow Assassin Scimitar";
const saveDC = 16;

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postSave") {
        // request the saving throw
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewEffects.applyPoisonedEffect2024(targetToken.actor, macroItem, ['shortRest', 'longRest'], 3600);

            if (workflow.saveResults[0][0].total <= (saveDC - 5)) {
                await HomebrewEffects.applySleepingEffect2024(targetToken.actor, macroItem, undefined, 3600);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
