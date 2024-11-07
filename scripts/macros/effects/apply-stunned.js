for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyStunnedEffect(tok.actor, this.uuid);
}
