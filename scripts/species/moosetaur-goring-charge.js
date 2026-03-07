/*
	If you move at least 20 feet straight toward a target and then hit it with a Gore attack on the same turn, and if
	the target is Large or smaller, it must make a Strength saving throw against your DC of 8 + your proficiency bonus +
	your Strength modifier. On a failed save, you knock the target prone.
*/
const optionName = "Goring Charge";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await targetToken.actor.toggleStatusEffect('prone', {active: true});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
