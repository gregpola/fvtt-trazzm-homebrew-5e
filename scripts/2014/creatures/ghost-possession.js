const version = "12.3.0";
const optionName = "Possession";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "possession-flag";
const possessedFlagName = "possessed-flag";
const possessedEffectName = "Possession (target)";
const effectName = "possession-source";

try {
    if (args[0] === "on") {
        // disable all active effects
        let disabledEffects = [];
        for (let effect of actor.effects) {
            if (!effect.disabled && effect.name !== optionName) {
                await effect.update({disabled: true});
                disabledEffects.push(effect.id);
            }
        }
        await actor.setFlag(_flagGroup, flagName, disabledEffects);

        // hide the ghost
        let effectData = {
            name: effectName,
            icon: 'icons/magic/perception/hand-eye-black.webp',
            changes: [
                {
                    key: 'system.traits.di.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: true,
                    priority: 20
                },
                {
                    key: 'flags.midi-qol.neverTarget',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: true,
                    priority: 21
                },
                {
                    key: 'ATL.hidden',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: true,
                    priority: 22
                }
            ],
            flags: {
            },
            origin: item.uuid,
            disabled: false
        };

        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});

    }
    else if (args[0] === "off") {
        const flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            await actor.unsetFlag(_flagGroup, flagName);

            for (let effectId of flag) {
                let effect = actor.effects.find(e => e.id === effectId);
                if (effect) {
                    await effect.update({disabled: false});
                }
            }
        }
        await HomebrewEffects.removeEffectByName(actor, effectName);

        // get the target of the possession and remove the effect
        const targetFlag = actor.getFlag(_flagGroup, possessedFlagName);
        if (targetFlag) {
            await actor.unsetFlag(_flagGroup, possessedFlagName);

            const targetToken = canvas.tokens.get(targetFlag);
            if (targetToken) {
                let eff = targetToken.actor.effects?.find(i=>i.name === possessedEffectName);
                if (eff) {
                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [eff.id] });
                }
            }
        }

    }
    else if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.hitTargets.first();
        if (target) {
            // store the target id for removal
            await actor.setFlag(_flagGroup, possessedFlagName, target.id);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
