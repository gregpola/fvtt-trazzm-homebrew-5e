for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyBlindedEffect(tok.actor, this.uuid);
}
