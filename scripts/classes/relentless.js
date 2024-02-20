/*
    Starting at 15th level, when you roll initiative and have no superiority dice remaining, you regain one superiority die.
*/
const version = "11.0";
const optionName = "Relentless";
const featureName = "Superiority Dice";

try {
    let featureItem = actor.items.find(i => i.name === featureName);
    if (featureItem) {
        let usesLeft = featureItem.system.uses?.value ?? 0;
        if (!usesLeft) {
            await featureItem.update({"system.uses.value": 1});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
