/*
	The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area
	becomes difficult terrain for the Duration. When a creature moves into or within the area, it takes 2d4 piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area at the time
	the spell is cast must make a Wisdom (Perception) check against your spell save DC to recognize the terrain as
	hazardous before entering it.

	The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area
	becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area when the spell
	is cast must take a Search action and succeed on a Wisdom (Perception) or Wisdom (Survival) check against your spell
	save DC to recognize the terrain as hazardous before entering it.
*/
const version = "13.5.0";
const optionName = "Spike Growth";

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
    console.error(`${optionName}: ${version}`, err);
}
