// Updates all actor's prototypeToken to show name and health on hover for all
for (let actor of game.actors) {
    const updates = game.actors.map(e => ({
        _id: e.id,
        prototypeToken:{
            lockRotation: true,
            displayBars: 30,
            displayName: 30
        }
    }));
    await Actor.updateDocuments(updates);
}
