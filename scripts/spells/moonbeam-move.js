/*
    A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range.
    Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the
    Cylinder up to 60 feet.
 */
const optionName = "Moonbeam Move";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "moonbeam-flag";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            const existingRegion = await fromUuid(flag.templateUuid);
            if (existingRegion) {
                let newRegion = await fromUuid(args[0].templateUuid);
                if (newRegion) {
                    await game.trazzm.socket.executeAsGM("updateTemplate", existingRegion.uuid, {shapes: newRegion.shapes});
                }
            }
            else {
                console.error(`${optionName}: ${version} -- unable to find the region`);
            }
        }
        else {
            console.error(`${optionName}: ${version} -- flag missing in actor`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

