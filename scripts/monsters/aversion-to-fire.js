/*
    If the elemental takes Fire damage, its Piercing Form trait doesn’t function on its next turn, and it has
    Disadvantage on attack rolls and ability checks until the end of its next turn.
*/
const optionName = "Aversion to Fire";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        if (workflow.damageDetail) {
            // look for fire damage
            const fireRolls = workflow.damageDetail.filter(i => ['fire'].includes(i.type));
            if (fireRolls && fireRolls.length > 0) {
                // apply penalties
                const activity = macroItem.system.activities.getName("Received Fire Damage");
                if (activity) {
                    await activity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
