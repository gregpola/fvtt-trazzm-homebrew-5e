/*
    One Medium or smaller creature that you choose must succeed on a Strength saving throw or be pushed up to 5 feet away from you.
*/
const optionName = "Gust - Push";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            if (["tiny", "sm", "med"].includes(targetToken.actor.system.traits.size)) {
                await HomebrewMacros.pushTarget(token, targetToken, 1);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
