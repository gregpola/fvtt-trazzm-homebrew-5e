/*
    An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5
    bonus to AC, including against the triggering attack, and you take no damage from magic missile.
*/
const version = "11.0";
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
