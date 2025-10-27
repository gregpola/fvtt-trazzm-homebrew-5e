/*
    A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If
    the saving throw fails by 5 or more, the creature is also unconscious while poisoned in this way.
*/
const optionName = "Drow Poison Sleep";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.failedSaves.first();
        if (targetToken) {
            const saveDC = macroActivity.save.dc.value;
            const saveRoll = workflow.tokenSaves[targetToken.document.uuid];

            if (saveDC && saveRoll && (saveRoll.total < (saveDC - 5))) {
                await HomebrewEffects.applySleepingEffect2024(targetToken.actor, macroItem, ['isDamaged', 'shortRest', 'longRest'], 3600);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
