/*
    The mephit explodes when it dies. Dexterity Saving Throw: DC 10, each creature in a 5-foot Emanation originating
    from the mephit. Failure: 5 (2d4) Bludgeoning damage. Success: Half damage.
*/
const optionName = "Death Burst";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        if (workflow.damageItem.newHP === 0) {
            let activity = macroItem.system.activities.getName('Save');
            if (activity) {
                await activity.use();
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
