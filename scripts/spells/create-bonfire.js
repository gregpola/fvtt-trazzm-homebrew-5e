/*
    You create a bonfire on ground that you can see within range. Until the spell ends, the magic bonfire fills a 5-foot
    cube. Any creature in the bonfire’s space when you cast the spell must succeed on a Dexterity saving throw or take
    1d8 fire damage. A creature must also make the saving throw when it moves into the bonfire’s space for the first
    time on a turn or ends its turn there.
 */
const version = "12.4.1";
const optionName = "Create Bonfire";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "create-bonfire-flag";
const animationFile = "modules/JB2A_DnD5e/Library/Generic/Fire/Eruption_01_Regular_Orange_600x600.webm";

try {
    if (rolledActivity?.name === "Cast") {
        if (args[0].macroPass === "preItemRoll") {
            Hooks.once("createMeasuredTemplate", async (template) => {
                await actor.setFlag(_flagGroup, flagName, {templateUuid: template.uuid});
                await template.update({
                    fillColor: 0,
                    fillAlpha: 0,
                    alpha: 0,
                    opacity: 0.1
                });
            });

            Hooks.once("createRegion", async (region) => {
                await region.update({'visibility': 0});
            });
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
