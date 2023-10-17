/*
	Take an action to douse the fire burning you
*/
const version = "11.0";
const optionName = "Douse Fire";

try {
    let effect = actor?.effects.find(ef => ef.name === 'Fire Form');
    if (effect) {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
    }

    effect = actor?.effects.find(ef => ef.name === 'Fire Elemental Touch');
    if (effect) {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
    }

    await warpgate.revert(token.document, "Douse Fire");
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
