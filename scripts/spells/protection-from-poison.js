/*
	You touch a creature and end the Poisoned condition on it. For the duration, the target has Advantage on saving
	throws to avoid or end the Poisoned condition, and it has Resistance to Poison damage.
*/
const optionName = "Protection from Poison";
const version = "12.4.0";

try {
    const targetToken = workflow.targets.first();

    if (args[0].macroPass === "postActiveEffects") {
        await targetToken.actor.toggleStatusEffect('poisoned', {active: false});
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
