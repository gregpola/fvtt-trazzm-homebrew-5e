/*
	A creature can end this damage by using its action to make a DC 10 Dexterity check to extinguish the flames.
*/
const version = "12.3.0";
const optionName = "Extinguish Alchemist's Fire";
const effectName = "Alchemist's Fire Burning";

try {
    let effect = HomebrewHelpers.findEffect(actor, effectName);
    if (effect) {
        let roll = await actor.rollAbilityTest('dex', {targetValue: 10});
        if (roll.total >= 10) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
            ChatMessage.create({
                content: `${actor.name} extinguishes the fire!`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
