/*
    You point at one creature you can see within range, and the single chime of a dolorous bell is audible within 10
    feet of the target. The target must succeed on a Wisdom saving throw or take 1d8 Necrotic damage. If the target is
    missing any of its Hit Points, it instead takes 1d12 Necrotic damage.
*/
const optionName = "Toll the Dead";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            let targetUuids = [targetToken.document.uuid];
            if (targetToken.actor.system.attributes.hp.value < targetToken.actor.system.attributes.hp.max) {
                const act = macroItem.system.activities.find(a => a.identifier === 'damaged-target');
                if (act) await MidiQOL.completeActivityUse(act, { midiOptions: { targetUuids } });

            }
            else {
                const act = macroItem.system.activities.find(a => a.identifier === 'healthy-target');
                if (act) await MidiQOL.completeActivityUse(act, { midiOptions: { targetUuids } });

            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
