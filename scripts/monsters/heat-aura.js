/*
	At the end of each of the elemental’s turns, each creature in a 5-foot Emanation originating from the elemental takes 7 (2d6) Fire damage.
*/
const optionName = "Heat Aura";
const version = "14.5.0";

try {
    if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        // heat-aura-damage
        let activity = await macroItem.system.activities.find(a => a.identifier === 'heat-aura-damage');
        if (activity) {
            await activity.use();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
