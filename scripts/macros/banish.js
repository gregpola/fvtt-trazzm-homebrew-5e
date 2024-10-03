const version = "12.3.0";
const optionName = "Banish";
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

    let effectData = {
        'name': 'Banished',
        'icon': 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
        'changes': [
            {
                "key": "system.details.type.custom",
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                "value": "NoTarget",
                "priority": 20
            },
            {
                "key": "system.traits.di.all",
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                "value": "true",
                "priority": 20
            }
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tok.actor.uuid, effects: [effectData]});
    await tok.document.update({ "hidden": true });
    await ChatMessage.create({ content: `${tok.name} was banished`});
}

