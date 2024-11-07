for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyInvisibleEffect(tok.actor, this.uuid);
}
