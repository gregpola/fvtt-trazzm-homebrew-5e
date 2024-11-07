for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyPoisonedEffect(tok.actor, this.uuid);
}
