/*
    At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has
    Advantage on the save if the save is triggered by damage. On a successful save, the spell ends.
*/
const optionName = "Tashas Hideous Laughter";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await targetToken.actor.toggleStatusEffect('prone', {active: true});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
