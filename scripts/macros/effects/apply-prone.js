for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyProneEffect(tok.actor, this.uuid);
}
