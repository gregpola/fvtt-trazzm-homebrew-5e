/*
    Swarming locusts fill a 20-foot-radius Sphere centered on a point you choose within range. The Sphere remains for
    the duration, and its area is Lightly Obscured and Difficult Terrain.

    When the swarm appears, each creature in it makes a Constitution saving throw, taking 4d10 Piercing damage on a
    failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell’s
    area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 5.
*/
const version = "12.4.2";
const optionName = "Insect Plague";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            // look for visibility and region
            await template.update({
                fillColor: 0,
                fillAlpha: 0,
                alpha: 0,
                opacity: 0.1
            });
        });

        Hooks.once("createRegion", async (region) => {
            // look for visibility and region
            await region.update({'visibility': 0});
        });
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
