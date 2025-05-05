/*
    If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your
    turn. The chosen attack roll mustn't have Disadvantage. If the chosen attack roll hits, the target takes an extra
    @scale.barbarian.brutal-strike damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one
    Brutal Strike effect of your choice. You have the following effect options.

    Forceful Blow. The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight
    toward the target without provoking Opportunity Attacks.

    Hamstring Blow. The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected
    by only one Hamstring Blow at a time - the most recent one.
*/
const optionName = "Brutal Strike";
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
                const hamstringBlow = actor.effects.find(e => e.name === 'Hamstring Blow');
                const forcefulBlow = actor.effects.find(e => e.name === 'Forceful Blow');
                if (hamstringBlow) {
                    await applyHamstring(token, targetToken);
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [hamstringBlow.id]
                    });
                }

                if (forcefulBlow) {
                    await HomebrewMacros.pushTarget(token, targetToken, 3);
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [forcefulBlow.id]
                    });
                }

                // Set feature used this turn
                await HomebrewHelpers.setTurnCheck(actor, _flagName);

                // return damage bonus
                const damageDice = actor.system.scale.barbarian["brutal-strike"];
                return {damageRoll: `${damageDice}`, flavor: optionName};
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

async function applyHamstring(token, targetToken) {
    let effectData = {
        name: 'Hamstrung',
        icon: 'icons/magic/movement/abstract-ribbons-red-orange.webp',
        changes: [
            {
                key: 'system.attributes.movement.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: -15,
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: ['shortRest', 'turnStartSource', 'combatEnd']
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
