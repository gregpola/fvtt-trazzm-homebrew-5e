/**
 * A distracting melody momentarily fills a 20-foot-radius sphere centered on a point you choose within range. Each
 * creature in the Sphere makes a Constitution saving throw. On a failed save, a target loses &Reference[Concentration],
 * and it has Disadvantage on Constitution saving throws to maintain Concentration for the spell’s duration.
 */
const optionName = "Disruptive Tune";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewEffects.removeAllConcentrationEffects(targetToken.actor);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
