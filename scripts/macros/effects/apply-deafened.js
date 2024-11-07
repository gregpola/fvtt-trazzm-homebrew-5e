for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyDeafenedEffect(tok.actor, this.uuid);
}
