for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyUnconsciousEffect(tok.actor, this.uuid);
}
