for (let tok of canvas.tokens.controlled) {
    await tok.actor.update({'system.attributes.inspiration' : true});
}

