/*
	When the invisibility ends, each creature in a 5-foot Emanation originating from the target must succeed on a
	Constitution saving throw or take Necrotic damage equal to two rolls of your Bardic Inspiration die.
*/
const optionName = "Shade Spirit Shard";
const version = "14.5.0";

try {
    if (args[0] === "on") {
    }
    else if (args[0] === "off") {
        // get the shard and trigger it
        let activity = await macroItem.system.activities.getName("Save");
        if (activity) {
            await activity.use();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
