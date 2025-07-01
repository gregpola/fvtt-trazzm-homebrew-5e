/*
    You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot Cube there for the duration.
    The webs are Difficult Terrain, and the area within them is Lightly Obscured.

    If the webs aren’t anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or
    ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat
    surface have a depth of 5 feet.

    The first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving
    throw or have the Restrained condition while in the webs or until it breaks free.

    A creature Restrained by the webs can take an action to make a Strength (Athletics) check against your spell save DC.
    If it succeeds, it is no longer Restrained.

    The webs are flammable. Any 5-foot Cube of webs exposed to fire burns away in 1 round, dealing 2d4 Fire damage to
    any creature that starts its turn in the fire.
 */
const optionName = "Web";
const version = "12.4.2";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const textureFile = "modules/JB2A_DnD5e/Library/2nd_Level/Web/Web_01_White_Thumb.webp";

try {
    if (rolledActivity?.name === "Cast") {
        if (args[0].macroPass === "preItemRoll") {
            Hooks.once("createMeasuredTemplate", async (template) => {
                console.log(template);
                await template.update({
                    fillColor: 0,
                    fillAlpha: 0,
                    alpha: 0,
                    opacity: 0.1,
                    texture: textureFile
                });

                // await template.update({'fillColor': template.borderColor});
                // await template.update({'texture': textureFile});
            });

            Hooks.once("createRegion", async (region) => {
                await region.update({'visibility': 0});
            });
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
