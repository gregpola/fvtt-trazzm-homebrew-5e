/*
    If the beast moved at least 20 feet straight toward the target before the hit, the target takes an extra 1d6 damage
    of the same type, and the target has the Prone condition if it is a Large or smaller creature.
*/
const optionName = "Beast Strike - Charge";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {
                await targetToken.actor.toggleStatusEffect('prone', {active: true});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
