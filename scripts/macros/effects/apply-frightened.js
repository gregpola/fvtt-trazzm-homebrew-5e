for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyFrightenedEffect(tok.actor, this.uuid);
}
