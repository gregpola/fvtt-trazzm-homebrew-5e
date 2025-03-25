/*
    The first time you cast a damage-dealing spell of 4th level or lower within 1 minute after drinking the potion,
    instead of rolling dice to determine the damage dealt, you can instead use the highest number possible for each die.
*/
const version = "12.3.0";
const optionName = "Potion of Maximum Power";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (workflow.item.type === "spell" && workflow.item.system.level < 5) {
            await Promise.all(workflow.damageRolls.map(async (damageRoll, i, arr) => {
                arr[i] = await damageRoll.reroll({maximize: true});
            }));
            workflow.setDamageRolls(workflow.damageRolls);

            // remove the effect
            await HomebrewEffects.removeEffectByName(actor, optionName);
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
