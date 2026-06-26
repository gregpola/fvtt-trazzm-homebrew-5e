/*
    You create a lash of lightning energy that strikes at one creature of your choice that you can see within 15 feet of
    you. The target must succeed on a Strength saving throw or be pulled up to 10 feet in a straight line toward you and
    then take 1d8 lightning damage if it is within 5 feet of you.

    This spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).
*/
const optionName = "Lightning Lure";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postSave") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewMacros.pullTargetTowardsSelf(token, targetToken, 10, optionName);
        }
        await HomebrewMacros.wait(1000);
    }
    else if (args[0].macroPass === "postActiveEffects") {
        const targetUuids = Array.from(workflow.failedSaves).map(t => t.document.uuid);
        const activity = macroItem.system.activities.find(a => a.identifier === 'lightning-lure-damage');
        if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
