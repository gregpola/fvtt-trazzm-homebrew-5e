const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _regenerationFlag = "regeneration-flag";
const _regenerationTimeFlag = "regeneration-time-flag";
const _damageTypesFlag = "damage-types";
const _regenOffEffectName = "Regeneration Off";
const _regenRegExp = new RegExp("regains ([0-9]+|[0-9]*d0*[1-9][0-9]*) hit points");
const _regenStopRegExp = new RegExp("takes ([a-z ]*) damage");

let noRegenEffectData = {
    'name': `${_regenOffEffectName}`,
    'icon': 'icons/svg/frozen.svg',
    'changes': [
    ],
    'flags': {
        'dae': {
            'selfTarget': false,
            'selfTargetAlways': false,
            'stackable': 'none',
            'durationExpression': '',
            'macroRepeat': 'none',
            'specialDuration': [
                'longRest'
            ]
        }
    }
};

// The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate.


export async function handleRegeneration(combat, update, context) {
    let actor = combat?.combatant?.actor;

    if (actor) {
        let regenFlag = actor.getFlag(_flagGroup, _regenerationFlag);
        if (regenFlag) {
            var currentHP = actor.system.attributes.hp.value;
            var maxHP = actor.system.attributes.hp.max;

            // skip if not injured
            if (currentHP === maxHP)
                return;

            // check if already did regeneration this round
            let regenRoundFlag = actor.getFlag(_flagGroup, _regenerationTimeFlag);
            if (regenRoundFlag && regenRoundFlag === game.combat.round) {
                console.log("Skipping regeneration, already done this round")
                return;
            }

            let damageTypesReceived = actor.getFlag(_flagGroup, _damageTypesFlag);
            await actor.unsetFlag(_flagGroup, _damageTypesFlag);
            let doRegen = shouldRegenerateThisTurn(regenFlag, damageTypesReceived);

            if (currentHP <= 0) {
                // check for death handling
                const noRegenEffect = actor.effects.find(ef => ef.name === _regenOffEffectName);

                if (!doRegen && !noRegenEffect) {
                    await MidiQOL.socket().executeAsGM('createEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [noRegenEffectData]
                    });
                }
            }

            if (doRegen) {
                const rollObject = await new Roll(regenFlag.healAmount).evaluate({async: true});
                let regenRoll = rollObject.total;
                await actor.applyDamage(- regenRoll);

                // mark last regen flag
                await actor.setFlag(_flagGroup, _regenerationTimeFlag, game.combat.round);

                await ChatMessage.create({
                    content: `${actor.name} regenerated ${regenRoll} hit points`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});
            }
        }
    }
}

function shouldRegenerateThisTurn(regenFlag, damageTypesReceived) {
    if (regenFlag.suppressionTypes && damageTypesReceived) {
        if ((regenFlag.suppressionTypes.length > 0) && (damageTypesReceived.length > 0)) {
            for (let rf of regenFlag.suppressionTypes) {
                if (damageTypesReceived.includes(rf))
                    return false;
            }
        }
    }

    return true;
}

export async function checkForRegeneration(actor) {
    if (actor) {
        // remove old regen flag
        await actor.unsetFlag(_flagGroup, _regenerationFlag);

        // find and parse the regeneration feature
        let regenItem = actor.items.find(f => f.name === "Regeneration");
        if (regenItem) {
            const desc = regenItem.system.description;
            if (desc && desc.value && desc.value.length > 0) {
                let hpRecoveryFormula = undefined;
                let suppressTypes = [];

                const secondSentence = desc.value.indexOf(".") + 1;
                //const thirdSentence = secondSentence ? desc.value.indexOf(".", secondSentence) + 1 : 0;

                // look for hp recovery value
                let matchRegen = desc.value.match(_regenRegExp);
                if (matchRegen) {
                    hpRecoveryFormula = matchRegen[1];
                }

                // look for damage types that suppress regeneration
                if (secondSentence) {
                    let typeSentence = desc.value.substring(secondSentence);
                    let matchDT = typeSentence.match(_regenStopRegExp);
                    if (matchDT) {
                        const typesExpression = matchDT[1];
                        suppressTypes = typesExpression.split(" or ");
                        console.log(suppressTypes);
                    }
                }

                if (hpRecoveryFormula) {
                    await actor.setFlag(_flagGroup, _regenerationFlag, {healAmount: hpRecoveryFormula, suppressionTypes: suppressTypes});
                }
            }
        }
    }
}

export async function applyDamageTypes(actor, change, options) {
    let damageTypesReceived = actor.getFlag(_flagGroup, _damageTypesFlag);
    if (!damageTypesReceived) {
        damageTypesReceived = [];
    }

    const damageDetails = options.damageItem?.damageDetail;
    if (damageDetails) {
        let addedDamageType = false;

        for (let dd of damageDetails) {
            for (let dtype of dd) {
                if (dtype.type && !damageTypesReceived.includes(dtype.type)) {
                    damageTypesReceived.push(dtype.type);
                    addedDamageType = true;
                }
            }
        }

        if (addedDamageType) {
            await actor.setFlag(_flagGroup, _damageTypesFlag, damageTypesReceived);
        }
    }
}
