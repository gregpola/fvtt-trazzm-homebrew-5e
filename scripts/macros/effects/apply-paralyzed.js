for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyParalyzedEffect(tok.actor, this.uuid);
}
