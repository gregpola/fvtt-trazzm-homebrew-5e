for (let tok of canvas.tokens.controlled) {
    let removeList = tok.actor?.effects.map(e=>e.id);
    if(removeList)
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tok.actor.uuid, effects: removeList });
}
