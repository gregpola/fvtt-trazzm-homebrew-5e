/*
    A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range.
    Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the
    Cylinder up to 60 feet.

    When the Cylinder appears, each creature in it makes a Constitution saving throw. On a failed save, a creature takes
    2d10 Radiant damage, and if the creature is shape-shifted (as a result of the Polymorph spell, for example), it
    reverts to its true form and can’t shape-shift until it leaves the Cylinder. On a successful save, a creature takes
    half as much damage only. A creature also makes this save when the spell’s area moves into its space and when it
    enters the spell’s area or ends its turn there. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot.The damage increases by 1d10 for each spell slot level above 2.
 */
const optionName = "Moonbeam";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "moonbeam-flag";

try {
    if (rolledActivity?.name === "Cast") {
        if (args[0].macroPass === "preItemRoll") {
            Hooks.once("createMeasuredTemplate", async (template) => {
                await actor.setFlag(_flagGroup, flagName, {templateUuid: template.uuid});
                await template.update({'hidden': true});
            });

            Hooks.once("createRegion", async (region) => {
                await region.update({'visibility': 0});
            });
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
