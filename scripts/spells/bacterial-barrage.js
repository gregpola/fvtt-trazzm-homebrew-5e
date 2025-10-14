/*
    You attack a creature in range with a quick spreading infection that takes advantage of existing conditions. Make a
    ranged spell attack against a target, on a hit the infection does 1d8 necrotic damage to the target. If the target
    is suffering from the poisoned condition or a disease, it instead takes 1d12 necrotic damage.
*/
const optionName = "Bacterial Barrage";
const version = "13.5.0";

try {
    if (args[0].macroPass === "preDamageRoll") {
        let targetToken = workflow.targets.first();
        if (targetToken) {

        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
