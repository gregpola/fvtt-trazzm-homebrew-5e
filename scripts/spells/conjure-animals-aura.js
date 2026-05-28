/*
	Whenever the pack moves within 10 feet of a creature you can see and whenever a creature you can see enters a space
	within 10 feet of the pack or ends its turn there, you can force that creature to make a Dexterity saving throw. On
	a failed save, the creature takes 3d10 Slashing damage. A creature makes this save only once per turn.
*/
const optionName = "Conjure Animals";
const version = "14.5.0";
const _flagName = "conjure-animals-use-flag";

try {
    if ((args[0] === "on") || (args[0] === "each" && lastArgValue.turn === "endTurn")) {
        if (HomebrewHelpers.perTurnCheck(actor, _flagName, 'tokenTurnEnd')) {
            const applyActivity = await macroItem.system.activities.find(a => a.identifier === 'save');
            if (applyActivity) {
                const targetUuids = [token.document.uuid];
                await MidiQOL.completeActivityUse(applyActivity, {midiOptions: {targetUuids}});
                await HomebrewHelpers.setTurnCheck(actor, _flagName);
            }
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
