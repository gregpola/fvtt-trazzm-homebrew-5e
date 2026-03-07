const _damageTypesFlag = "damage-types";
const _regenerationTimeFlag = "regeneration-time-flag";
const _regenOffEffectName = "Regeneration Off";

class MonsterMacros {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering MonsterMacros");
        MonsterMacros.hooks();
    }

    static hooks() {
    }

    static get regenerationTimeFlag() {
        return _regenerationTimeFlag;
    }

    static async shouldRegenerateThisTurn(actor, suppressionTypes) {
        if (!HomebrewHelpers.isAvailableThisTurn(actor, _regenerationTimeFlag)) {
            return false;
        }

        const noRegenEffect = actor.effects.find(ef => ef.name === _regenOffEffectName);
        if (noRegenEffect) {
            return false;
        }

        // check for full health
        var currentHP = actor.system.attributes.hp.value;
        var maxHP = actor.system.attributes.hp.max;
        if (currentHP === maxHP) {
            return false;
        }

        let damageTypesReceived = actor.getFlag("fvtt-trazzm-homebrew-5e", _damageTypesFlag);
        if (suppressionTypes && damageTypesReceived) {
            if ((suppressionTypes.length > 0) && (damageTypesReceived.length > 0)) {
                for (let rf of suppressionTypes) {
                    if (damageTypesReceived.includes(rf))
                        return false;
                }
            }
        }

        return true;
    }

    static async applyDamageTypes(actor, damageDetails) {
        let damageTypesReceived = actor.getFlag("fvtt-trazzm-homebrew-5e", _damageTypesFlag);
        if (!damageTypesReceived) {
            damageTypesReceived = [];
        }

        if (damageDetails) {
            let addedDamageType = false;

            for (let dd of damageDetails) {
                if (dd.type && !damageTypesReceived.includes(dd.type)) {
                    damageTypesReceived.push(dd.type);
                    addedDamageType = true;
                }
            }

            if (addedDamageType) {
                await actor.setFlag("fvtt-trazzm-homebrew-5e", _damageTypesFlag, damageTypesReceived);
            }
        }
    }

    static async clearDamageTypes(actor) {
        await actor.unsetFlag("fvtt-trazzm-homebrew-5e", _damageTypesFlag);
    }

    static async applyNoRegenerationEffect(actor) {
        let noRegenEffectData = {
            'name': `${_regenOffEffectName}`,
            'icon': 'icons/svg/frozen.svg',
            'changes': [
            ],
            'flags': {
                'dae': {
                    'selfTarget': false,
                    'selfTargetAlways': false,
                    'stackable': 'noneNameOnly',
                    'durationExpression': '',
                    'macroRepeat': 'none',
                    'specialDuration': [
                        'longRest', 'endCombat'
                    ]
                }
            }
        };

        await MidiQOL.socket().executeAsGM('createEffects', {
            'actorUuid': actor.uuid,
            'effects': [noRegenEffectData]
        });
    }

}
