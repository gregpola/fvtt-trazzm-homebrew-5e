for (let tok of canvas.tokens.controlled) {
    await HomebrewEffects.applySleepingEffect(tok.actor, this.uuid);
}
