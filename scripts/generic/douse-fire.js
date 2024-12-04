/*
	Take an action to douse the fire burning you
*/
const version = "12.3.0";
const optionName = "Douse Fire";

try {
    let effect = actor?.effects.find(ef => ef.name === 'On Fire');
    if (effect) {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
    }

    effect = actor?.effects.find(ef => ef.name === 'Fire Elemental Touch');
    if (effect) {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
