for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyCharmedEffect(tok.actor, this.uuid);
}
