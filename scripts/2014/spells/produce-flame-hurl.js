const version = "12.3.0";
const optionName = "Flickering Flame";
const spellName = "Produce Flame";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let spellEffect = HomebrewHelpers.findEffect(actor, spellName);
        if (spellEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [spellEffect.id] });
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
