/*
	In addition, whenever a creature of your choice starts its turn within a 10-foot Emanation originating from your
	companion, the creature must succeed on a Wisdom saving throw against your spell save DC or have the Frightened
	condition until the start of its next turn.
*/
const optionName = "Gaunt Aura";
const version = "14.5.0";

try {
    if ((args[0] === "on") || (args[0] === "each" && lastArgValue.turn === "startTurn")) {
        const applyActivity = await macroItem.system.activities.find(a => a.identifier === 'save');
        if (applyActivity) {
            const targetUuids = [token.document.uuid];
            await MidiQOL.completeActivityUse(applyActivity, {midiOptions: {targetUuids}});
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}