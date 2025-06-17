/*
    Strength Saving Throw: DC 13, each Medium or smaller creature in the air elemental's space.

    Failure: 24 (4d10 + 2) Thunder damage, and the target is pushed up to 20 feet straight away from the air elemental and has the Prone condition.

    Success: Half damage only.
*/
const version = "12.4.0";
const optionName = "Whirlwind";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let target of workflow.failedSaves) {
            await HomebrewMacros.flingTarget(target, 4);
            await target.actor.toggleStatusEffect('prone', {active: true});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
