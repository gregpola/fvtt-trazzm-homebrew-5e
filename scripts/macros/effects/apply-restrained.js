for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyRestrainedEffect(tok.actor, this.uuid, 13);
}
