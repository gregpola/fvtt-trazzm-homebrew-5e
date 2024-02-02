const version = "11.0";
let frightenedEffect = actor?.effects.find(ef => ef.name === 'Frightened');
if (frightenedEffect) {
    await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': [frightenedEffect.id]});
}
