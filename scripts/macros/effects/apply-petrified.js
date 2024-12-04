for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applyPetrifiedEffect(tok.actor, this.uuid);
}
