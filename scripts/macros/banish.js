const version = "11.0";
const optionName = "Banish";
const mutationFlag = "banished";
const flagName = "banished-effects-disabled";

for (let tok of canvas.tokens.controlled) {
    // disable all active effects
    let disabledEffects = [];
    for (let effect of tok.actor.effects) {
        if (!effect.disabled) {
            await effect.update({disabled: true});
            disabledEffects.push(effect.id);
        }
    }
    await tok.actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, disabledEffects);

    const updates = {
        actor: {
            'system.traits.di.all': true,
            'system.details.type.custom' : 'NoTarget'
        }
    };
    await warpgate.mutate(tok.document, updates, {}, { name: mutationFlag });

    await tok.document.update({ "hidden": true });
    await ChatMessage.create({ content: `${tok.name} was banished`});
}