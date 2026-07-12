/*
    At the start of each of its turns, the elemental deals 5 (1d10) Piercing damage to any creature with 5 feet of it.
*/
const optionName = "Piercing Form";
const version = "14.5.0";

try {
    if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        // heat-aura-damage
        let activity = await macroItem.system.activities.find(a => a.identifier === 'piercing-form-damage');
        if (activity) {
            await activity.use();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
