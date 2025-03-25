/*
    The tunnel spider can create a 10-ft.-deep pit trap when it breaches through a rock or earthen surface it is
    burrowing through. Any creature within 5 feet of the pit trap when it is created must succeed on a DC 14 Dexterity
    saving throw or fall into the pit, taking 3 (1d6) falling damage and landing prone.
*/
const version = "12.3.0";
const optionName = "Tunnel Spider Trapdoor";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
