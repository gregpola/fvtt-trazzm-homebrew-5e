/**
    The first time you drop to 0 hit points while wearing this cloak, you instead drop to 1 hit point. The silver runes
    go dark and cold until the next dawn.
*/
const version = "14.5.0";
const optionName = "Death Ward";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // check for reduction to 0 hp
        if (workflow.damageItem.newHP === 0) {
            const deathWardActivity = macroItem.system.activities.getName("Death Ward");
            if (deathWardActivity) {
                const maxValue = deathWardActivity.uses.max;
                const spentValue = deathWardActivity.uses.spent;

                if (spentValue < maxValue) {
                    await deathWardActivity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
