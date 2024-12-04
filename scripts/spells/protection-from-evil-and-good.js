/*
    Until the spell ends, one willing creature you touch is protected against certain types of creatures: aberrations,
    celestials, elementals, fey, fiends, and undead.

    The protection grants several benefits. Creatures of those types have disadvantage on attack rolls against the
    target. The target also can't be Charmed, Frightened, or possessed by them. If the target is already charmed,
    frightened, or possessed by such a creature, the target has advantage on any new saving throw against the relevant effect.
*/
const version = "12.3.0";
const optionName = "Protection from Evil and Good";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const types = ["aberration", "celestial", "elemental", "fey", "fiend", "undead"];

try {
    if (args[0].macroPass === "preCheckSaves") {
        // todo check for effect types
        console.log(item);
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}



game.midiHookIdProtectionFromEvilandGoodSaveToFreeFromEffects = Hooks.on("renderApplication", async (dialog,element,options) => {
    if (!options?.content?.includes("<p>What type of")) return;
    const response = await Dialog.confirm({
        title: "Save Prompt",
        content: `<p>Is this a save for overcoming a Charmed, Frightened or Possessed effect?</p>`,
    });
    if (!response) return;
    Hooks.once("dnd5e.preRollAbilitySave",(actor,update,key) => {
        foundry.utils.setProperty(update,"advantage",true)
    })
})

game.midiHookIdProtectionFromEvilandGood = Hooks.on("midi-qol.preCheckSaves", async (workflow) => {
    console.log(workflow)
    if (!types.some(cr => workflow.actor.system.details.race?.includes(cr) || workflow.actor.system.details.type?.value?.includes(cr) )) return;
    Hooks.once("dnd5e.preRollAbilitySave",(actor,update,key) => {
        foundry.utils.setProperty(update,"advantage",true)
    })
});
