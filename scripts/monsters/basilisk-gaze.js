/*
    Constitution Saving Throw: DC 12, each creature in a 30-foot Cone. If the basilisk sees its reflection in the Cone,
    the basilisk must make this save.

    First Failure: The target has the Restrained condition and repeats the save at the end of its next turn if it is
    still Restrained, ending the effect on itself on a success.

    Second Failure: The target has the Petrified condition instead of the Restrained condition.
*/
const optionName = "Basilisk Gaze";
const version = "12.4.1";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await targetToken.actor.toggleStatusEffect('restrained', {active: true});
            //await targetToken.actor.toggleStatusEffect('petrified', {active: true});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
