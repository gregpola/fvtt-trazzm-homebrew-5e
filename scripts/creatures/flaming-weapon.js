/*
    As a bonus action, the guard can wreath one melee weapon it is wielding in flame. The guard is unharmed by this fire,
    which lasts until the end of the guard’s next turn. While wreathed in flame, the weapon deals an extra 3 (1d6) fire damage on a hit.
*/
const version = "11.0";
const optionName = "Flaming Weapon";

try {
    if (args[0].macroPass === "DamageBonus") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            if (workflow.item.system.actionType === "mwak") {

            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
