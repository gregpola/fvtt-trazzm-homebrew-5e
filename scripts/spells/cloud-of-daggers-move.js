/*
    You conjure spinning daggers in a 5-foot Cube centered on a point within range. Each creature in that area takes
    4d4 Slashing damage. A creature also takes this damage if it enters the Cube or ends its turn there or if the Cube
    moves into its space. A creature takes this damage only once per turn.

    On your later turns, you can take a Magic action to teleport the Cube up to 30 feet.

    Using a Higher-Level Spell Slot. The damage increases by 2d4 for each spell slot level above 2.
 */
const optionName = "Cloud of Daggers Move";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "cloud-of-daggers-flag";

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

