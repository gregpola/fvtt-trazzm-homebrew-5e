/*
	If the [[lookup @name lowercase]] takes Fire damage, it has Disadvantage on attack rolls and ability checks until the end of its next turn.
*/
const optionName = "Fear of Fire";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetDamageApplication") {
        for (let dd of workflow.damageDetail) {
            if (dd.type === 'fire') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'apply');
                if (activity) {
                    await activity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
