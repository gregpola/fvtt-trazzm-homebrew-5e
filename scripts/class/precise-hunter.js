/*
    You have Advantage on attack rolls against the creature currently marked by your Hunter’s Mark.
*/
const version = "12.4.0";
const optionName = "Precise Hunter";
const targetEffectName = "Hunter's Marked";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            const marked = targetToken.actor?.getRollData()?.effects.find(e => e.name === targetEffectName && e.origin.startsWith(originStart));
            if (marked) {
                workflow.advantage = true;
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
