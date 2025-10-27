/*
    You conjure spinning daggers in a 5-foot Cube centered on a point within range. Each creature in that area takes
    4d4 Slashing damage. A creature also takes this damage if it enters the Cube or ends its turn there or if the Cube
    moves into its space. A creature takes this damage only once per turn.

    On your later turns, you can take a Magic action to teleport the Cube up to 30 feet.

    Using a Higher-Level Spell Slot. The damage increases by 2d4 for each spell slot level above 2.
 */
const version = "12.4.3";
const optionName = "Cloud of Daggers";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "cloud-of-daggers-flag";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            await actor.setFlag(_flagGroup, flagName, {templateUuid: template.uuid});

            await template.update({
                fillAlpha: 0,
                alpha: 0,
                opacity: 0.1
            });
        });
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
