/*
    An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC,
    including against the triggering attack, and you take no damage from Magic Missile.
*/
const version = "12.4.0";
const optionName = "Shield";

try {
    if (args[0].tag === "TargetOnUse") {
        if (workflow.item.name.includes("Magic Missile")) {
            workflow.damageItem.hpDamage = 0;
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
