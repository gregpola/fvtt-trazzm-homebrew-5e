/*
    At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has
    Advantage on the save if the save is triggered by damage. On a successful save, the spell ends.
*/
const optionName = "Tashas Hideous Laughter";
const version = "14.5.1";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // trigger save
        let effect = HomebrewEffects.findEffect(actor, "Uncontrollable Laughter");
        if (effect) {
            const activity = macroItem.system.activities.getName("Overtime");
            if (activity) {
                const targetUuids = [token.document.uuid];
                await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
