/*
    At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has
    Advantage on the save if the save is triggered by damage. On a successful save, the spell ends.
*/
const optionName = "Tashas Hideous Laughter";
const version = "12.4.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // trigger save
        let effect = HomebrewHelpers.findEffect(actor, "Uncontrollable Laughter");
        if (effect) {
            const config = { undefined, ability: "wis", target: macroItem.parent.system.attributes.spelldc, advantage: true };
            const dialog = {};
            const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: actor }) } };
            let saveResult = await actor.rollSavingThrow(config, dialog, message);
            if (saveResult[0].isSuccess) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
