/*
    If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your
    turn. The chosen attack roll mustn't have Disadvantage. If the chosen attack roll hits, the target takes an extra
    @scale.barbarian.brutal-strike damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one
    Brutal Strike effect of your choice. You have the following effect options.

    You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options.

    Staggering Blow. The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity
    Attacks until the start of your next turn.

    Sundering Blow. Before the start of your next turn, the next attack roll made by another creature against the target
    gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus.
*/
const optionName = "Improved Brutal Strike";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "used-brutal-strike";

try {
    if (args[0].macroPass === "preItemRoll") {
        // make sure the actor is in a Reckless state
        const hasReckless = HomebrewHelpers.findEffect(actor, 'Reckless');
        if (!hasReckless) {
            ui.notifications.error(`${optionName}: ${version} - not reckless`);
            return false;
        }
    }
    else if (HomebrewHelpers.perTurnCheck(actor, _flagName, 'tokenTurn', true, token.id)) {
        if (args[0].macroPass === "DamageBonus" && (workflow.hitTargets.size > 0)) {
            // make sure it's not disadvantage
            if (workflow.disadvantage) {
                return ui.notifications.error(`${optionName}: ${version} - attack is at disadvantage`);
            }

            // make sure it's strength based
            if (workflow.item.abilityMod !== 'str') {
                return ui.notifications.error(`${optionName}: ${version} - not a Strength-based attack`);
            }

            const targetToken = workflow.hitTargets.first();
            if (targetToken) {
                // apply effect
                let blowName = 'Staggering Blow';
                const staggeringBlow = actor.effects.find(e => e.name === 'Staggering Blow');
                const sunderingBlow = actor.effects.find(e => e.name === 'Sundering Blow');
                if (staggeringBlow) {
                    await applyStaggered(token, targetToken);
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [staggeringBlow.id]
                    });
                }

                if (sunderingBlow) {
                    blowName = 'Sundering Blow';
                    await applySundered(token, targetToken);
                    await HomebrewMacros.pushTarget(token, targetToken, 3);
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [sunderingBlow.id]
                    });
                }

                // Set feature used this turn
                await HomebrewHelpers.setTurnCheck(actor, _flagName);

                // return damage bonus
                const damageDice = actor.system.scale.barbarian["brutal-strike"];
                return {damageRoll: `${damageDice}`, flavor: `${optionName} - ${blowName}`};
            }
        }
        else if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
            if (workflow.item.abilityMod === 'str') {
                const recklessEffect = HomebrewHelpers.findEffect(actor, 'Reckless');
                if (recklessEffect) {
                    await recklessEffect.update({disabled: true});
                }
            }
        }
        else if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
            const recklessEffect = actor.effects.find(eff => eff.name === 'Reckless');
            if (recklessEffect) {
                await recklessEffect.update({disabled: false});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyStaggered(token, targetToken) {
    let effectData = {
        name: 'Staggered',
        icon: 'icons/magic/control/sihouette-hold-beam-green.webp',
        changes: [
            {
                key: 'flags.midi-qol.disadvantage.ability.save.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: true,
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: ['shortRest', 'turnStartSource', 'combatEnd', 'isSave']
            }
        },
        origin: item.uuid,
        duration: {
            seconds: null
        },
        disabled: false
    };

    return await MidiQOL.socket().executeAsGM("createEffects",
        {actorUuid: targetToken.actor.uuid, effects: [effectData]});

}

async function applySundered(token, targetToken) {
    let effectData = {
        name: 'Staggered',
        icon: 'icons/skills/wounds/bone-broken-marrow-yellow.webp',
        changes: [
            {
                key: 'flags.midi-qol.grants.attack.bonus.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: '+5',
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: ['shortRest', 'turnStartSource', 'combatEnd', 'isAttacked']
            }
        },
        origin: item.uuid,
        duration: {
            seconds: null
        },
        disabled: false
    };

    return await MidiQOL.socket().executeAsGM("createEffects",
        {actorUuid: targetToken.actor.uuid, effects: [effectData]});

}
