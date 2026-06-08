/*
    On a hit, the target must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If the saving
    throw fails by 5 or more, the target is also unconscious while poisoned in this way. The target wakes up if it takes
    damage or if another creature takes an action to shake it awake.
*/
const optionName = "Drow Poison";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.failedSaves.first();
        if (targetToken && (workflow.saveResults[0].total <=
            8)) {
            const targetUuids = [targetToken.document.uuid];
            const activity = rolledItem.system.activities.find(a => a.identifier === 'apply-sleeping');
            if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
