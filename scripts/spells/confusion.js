/*
    Each creature in a 10-foot-radius Sphere centered on a point you choose within range must succeed on a Wisdom saving
    throw, or that target can’t take Bonus Actions or Reactions and must roll 1d10 at the start of each of its turns to
    determine its behavior for that turn, consulting the table below.

    1 	    The target doesn’t take an action, and it uses all its movement to move. Roll 1d4 for the direction: 1, north; 2, east; 3, south; or 4, west.
    2–6 	The target doesn’t move or take actions.
    7–8 	The target doesn’t move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action.
    9–10 	The target chooses its behavior.

    At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success.

    turn=end, saveAbility=wis, saveDC=@attributes.spell.dc, label=Confusion
*/
const optionName = "Confusion";
const version = "12.4.0";
const rollTableId = "Compendium.dnd-players-handbook.tables.RollTable.phbsplConfusionB";

try {
    if (args[0] === "each") {
        // roll the table
        const table = await fromUuid(rollTableId);
        if (table) {
            const {roll, results} = await table.draw({displayChat: false});
            if (results) {
                await table.toMessage(results, {roll, messageData: {speaker: {alias: actor.name}}});
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - unable to locate the roll table!`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
