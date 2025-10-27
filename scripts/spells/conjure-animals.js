/*
	Whenever the pack moves within 10 feet of a creature you can see and whenever a creature you can see enters a space
	within 10 feet of the pack or ends its turn there, you can force that creature to make a Dexterity saving throw. On
	a failed save, the creature takes 3d10 Slashing damage. A creature makes this save only once per turn.
*/
const optionName = "Conjure Animals";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "conjure-animals-flag";

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
