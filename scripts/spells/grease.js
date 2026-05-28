/*
    Nonflammable grease covers the ground in a 10-foot square centered on a point within range and turns it into
    Difficult Terrain for the duration.

    When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the
    Prone condition. A creature that enters the area or ends its turn there must also succeed on that save or fall Prone.
*/
const optionName = "Grease";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let tt of workflow.failedSaves) {
            await tt.actor.toggleStatusEffect('prone', {active: true});
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
