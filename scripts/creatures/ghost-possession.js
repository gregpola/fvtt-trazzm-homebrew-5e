const version = "11.0";
const optionName = "Possession";
const flagName = "possession-flag";
const mutationFlag = "possession-mutation";
const possessedFlagName = "possessed-flag";
const possessedEffectName = "Possession (target)";

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
        await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, disabledEffects);

        const updates = {
            actor: {
                'system.traits.di.all': true,
                'system.details.type.custom' : 'NoTarget'
            }
        };
        await warpgate.mutate(token.document, updates, {}, { name: mutationFlag });
        await token.document.update({ "hidden": true });
    }
    else if (args[0] === "off") {
        const flag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
        if (flag) {
            await actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);

            for (let effectId of flag) {
                let effect = actor.effects.find(e => e.id === effectId);
                if (effect) {
                    await effect.update({disabled: false});
                }
            }
        }

        await warpgate.revert(token.document, mutationFlag);
        await token.document.update({ "hidden": false });

        // get the target of the possession and remove the effect
        const targetFlag = actor.getFlag("fvtt-trazzm-homebrew-5e", possessedFlagName);
        if (targetFlag) {
            await actor.unsetFlag("fvtt-trazzm-homebrew-5e", possessedFlagName);

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
            await actor.setFlag("fvtt-trazzm-homebrew-5e", possessedFlagName, target.id);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
