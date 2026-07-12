/*
    If the elemental takes Cold or Fire damage, its Speed becomes 0, and it can’t use Engulf until the end of its next
    turn. However, a creature Grappled by the elemental has Disadvantage on ability checks made to escape the grapple
    during that time as well.
*/
const optionName = "Aversion to Cold and Fire";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        if (workflow.damageDetail) {
            // look for fire damage
            const fireRolls = workflow.damageDetail.filter(i => ['cold', 'fire'].includes(i.type));
            if (fireRolls && fireRolls.length > 0) {
                // apply penalties
                const activity = macroItem.system.activities.getName("Received Cold or Fire Damage");
                if (activity) {
                    await activity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
