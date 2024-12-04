for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyExhaustionEffect(tok.actor, this.uuid, 1);
}
