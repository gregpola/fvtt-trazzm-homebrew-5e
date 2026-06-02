/*
    You learn how to make your weapon strikes undercut a creature's ability to withstand your spells. When you hit a
    creature with an attack using a weapon, that creature has Disadvantage on the next saving throw it makes against a
    spell you cast before the end of your next turn.
*/
const optionName = "Eldritch Strike";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        const act = macroItem.system.activities.find(a => a.identifier === 'apply-struck');

        if (rolledItem.type === "weapon" && act && workflow.hitTargets.size) {
            const targetUuids = Array.from(workflow.hitTargets).map(t => t.document.uuid);
            await MidiQOL.completeActivityUse(act, { midiOptions: { targetUuids } });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
