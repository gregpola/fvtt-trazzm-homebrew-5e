for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyIncapacitatedEffect(tok.actor, this.uuid);
}
