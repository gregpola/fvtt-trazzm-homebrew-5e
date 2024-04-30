/*
    A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line. Each creature in the line
    must make a Constitution saving throw. On a failed save, a creature takes 6d8 radiant damage and is blinded until
    your next turn. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes
    have disadvantage on this saving throw.

    You can create a new line of radiance as your action on any turn until the spell ends.

    For the duration, a mote of brilliant radiance shines in your hand. It sheds bright light in a 30-foot radius and
    dim light for an additional 30 feet. This light is sunlight.
*/
const version = "11.0";
const optionName = "Sunbeam";
const beamItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.7LooxM5BftzzE5ao";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const summonFlag = "sunbeam-beam-item";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // add the new beam item to the caster
        let sunbeamBeamItem = await fromUuid(beamItemId);
        if (sunbeamBeamItem) {
            let tempItem = sunbeamBeamItem.toObject();
            let addedItem = await actor.createEmbeddedDocuments('Item',[tempItem]);
            if (addedItem && addedItem.length > 0) {
                await actor.setFlag(_flagGroup, summonFlag, addedItem[0].id);
            }
        }
        else {
            ui.notifications.error(`${optionName} - unable to find the item`);
        }

        // Apply blinded to the failed saves
        for(let targetToken of workflow.failedSaves) {
            let effectData = new ActiveEffect({
                name: "Sunbeam - Blinded",
                icon: "icons/magic/perception/eye-ringed-glow-angry-small-teal.webp",
                origin: actor.uuid,
                changes: [
                    {
                        key: `flags.midi-qol.OverTime`,
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: `turn=end, saveAbility=con, saveDC=${dc}, label=Blinded`,
                        priority: 20
                    },
                    {key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Blinded", priority: 21}
                ],
                duration: {seconds: 60}
            });
            await MidiQOL.socket().executeAsGM("createEffects", {
                actorUuid: target.actor.uuid,
                effects: [effectData.toObject()]
            })
            ChatMessage.create({
                content: `${target.name} is blinded by positive energy`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }
    else if (args[0] === "off") {
        const itemId = actor.getFlag(_flagGroup, summonFlag);
        if (itemId) {
            await actor.unsetFlag(_flagGroup, summonFlag);
            await actor.deleteEmbeddedDocuments('Item', [itemId]);
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
