/*
    When you manifest the Emanation and as a Bonus Action on your subsequent turns, you can choose another creature you
    can see in the Emanation. The target must succeed on a Constitution saving throw against your spell save DC or take
    Cold damage and, if the creature is Large or smaller, be pushed up to 15 feet away from you. To determine this
    damage, roll a number of d6s equal to your Wisdom modifier (minimum of one die).
*/
const optionName = "Wrath of the Sea";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewMacros.pushTarget(token, targetToken, 3);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
