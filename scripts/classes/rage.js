/*
    Macro is used to handle the various subclass features
*/
const version = "11.0";
const optionName = "Rage";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check for Fanatical Focus and add a use if uses is 0
        let fanaticalFocus = actor.items.getName("Fanatical Focus");
        if (fanaticalFocus) {
            if (fanaticalFocus.system.uses.value < 1) {
                await fanaticalFocus.update({"system.uses.value": 1});
            }
        }
    }

    // TODO add an each macro to end effect if they haven't attacked

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
