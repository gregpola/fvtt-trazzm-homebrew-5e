const deafenedName = 'Deafened';
const etherealName = 'Ethereal';
const poisonedName = 'Poisoned';
const sleepingName = 'Sleeping';

const halfCoverName = 'Cover (Half)';
const totalCoverName = 'Cover (Total)';
const threeQuartersCoverName = 'Cover (Three-Quarters)';

class HomebrewEffects {

    static async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    static filterEffectsByConditions(actor, conditions) {
        if (Array.isArray(conditions)) {
            let results = [];
            for (let effect of actor.getRollData().effects) {
                let autoCreated = effect.flags.dae?.autoCreated ?? false;
                if (!autoCreated) {
                    for (let cond of conditions) {
                        if ((effect.name.toLowerCase() === cond.toLowerCase()) || effect.statuses.has(cond.toLowerCase())) {
                            results.push(effect);
                        }
                    }
                }
            }

            return results;
        }
        else {
            // single string condition
            return actor.getRollData().effects.filter(i => i.statuses.has(conditions));
        }
    };

    static async removeEffectByName(actor, effectName) {
        const effect = HomebrewHelpers.findEffect(actor, effectName);
        if (effect) {
            await MidiQOL.socket().executeAsGM('removeEffects', {
                'actorUuid': actor.uuid,
                'effects': [effect.id]
            });
        }
    }

    static async removeEffectByNameAndOrigin(actor, effectName, origin) {
        const effect = HomebrewHelpers.findEffect(actor, effectName, origin);
        if (effect) {
            await MidiQOL.socket().executeAsGM('removeEffects', {
                'actorUuid': actor.uuid,
                'effects': [effect.id]
            });
        }
    }

    static async removeConcentrationEffectByName(actor, effectName) {
        const effect = HomebrewHelpers.findEffect(actor, `Concentrating: ${effectName}`);
        if (effect) {
            await MidiQOL.socket().executeAsGM('removeEffects', {
                'actorUuid': actor.uuid,
                'effects': [effect.id]
            });
        }
    }

    static async applyEtherealEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === deafenedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition deafened, already exists");
                return false;
            }

            let effectData = {
                name: etherealName,
                icon: 'icons/creatures/magical/spirit-undead-ghost-purple.webp',
                changes: [
                    {
                        key: 'flags.midi-qol.neverTarget',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'system.traits.di.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'system.traits.ci.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'ATL.hidden',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: true,
                        priority: 23
                    }
                ],
                statuses: [
                ],
                flags: {
                    dae: {
                        specialDuration: []
                    }
                },
                origin: originValue,
                duration: {
                    seconds: null
                },
                disabled: false
            };

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    // for 2024 the origin must be the activating item, not an uuid
    static async applyPoisonedEffect2024(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === poisonedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition poisoned, already exists");
                return false;
            }

            const hasPoisonImmunity = actor.system.traits.di.value.has('poison');
            if (hasPoisonImmunity) {
                console.log("HomebrewEffects - not applying condition poisoned, target is immune");
                return false;
            }

            let effectData = {
                name: origin.name,
                icon: origin.img,
                changes: [
                ],
                statuses: [
                    'poisoned'
                ],
                flags: {
                    dae: {
                        specialDuration: []
                    }
                },
                origin: originValue,
                duration: {
                    seconds: null
                },
                disabled: false
            };

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    // for 2024 the origin must be the activating item, not an uuid
    static async applySleepingEffect2024(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === sleepingName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition sleeping, already exists");
                return false;
            }

            let sleepingEffect = {
                name: origin.name,
                icon: origin.img,
                changes: [
                ],
                statuses: [
                    'sleeping'
                ],
                flags: {
                    'dae': {
                        'specialDuration': ['shortRest', 'longRest']
                    }
                },
                origin: originValue,
                duration: {
                    seconds: seconds
                },
                disabled: false
            };

            if (specialDurations) {
                sleepingEffect.flags.dae.specialDuration = sleepingEffect.flags.dae.specialDuration.concat(specialDurations);
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [sleepingEffect]});
        }

        return undefined;
    }

    static async applyHalfCoverEffect(actor, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === halfCoverName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition halfCover, already exists");
                return false;
            }

            let effectData = {
                name: halfCoverName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/broken-wall.svg',
                changes: [
                    {
                        key: 'system.attributes.ac.cover',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: 2,
                        priority: 20
                    },
                    {
                        key: 'system.abilities.dex.bonuses.save',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: 2,
                        priority: 21
                    }
                ],
                statuses: [
                ],
                flags: {
                    dae: {
                        specialDuration: ['turnStart']
                    }
                },
                origin: originValue,
                duration: {
                    seconds: null
                },
                disabled: false
            };

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyThreeQuartersCoverEffect(actor, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === threeQuartersCoverName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition threeQuartersCover, already exists");
                return false;
            }

            let effectData = {
                name: threeQuartersCoverName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/brick-wall.svg',
                changes: [
                    {
                        key: 'system.attributes.ac.cover',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: 5,
                        priority: 20
                    },
                    {
                        key: 'system.abilities.dex.bonuses.save',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: 5,
                        priority: 21
                    }
                ],
                statuses: [
                ],
                flags: {
                    dae: {
                        specialDuration: ['turnStart']
                    }
                },
                origin: originValue,
                duration: {
                    seconds: null
                },
                disabled: false
            };

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyTotalCoverEffect(actor, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === totalCoverName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition totalCover, already exists");
                return false;
            }

            let effectData = {
                name: totalCoverName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/castle.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.grants.attack.fail.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    }
                ],
                statuses: [
                ],
                flags: {
                    dae: {
                        specialDuration: ['turnStart']
                    }
                },
                origin: originValue,
                duration: {
                    seconds: null
                },
                disabled: false
            };

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async resizeActor(actor, size, effectName, originUuid, extraChanges = undefined) {
        // make sure there is a change
        const currentSize = actor.system.traits?.size ?? undefined;
        if (currentSize !== size) {
            if (currentSize) {
                const sizeData = CONFIG.DND5E.actorSizes[size];
                if (sizeData) {
                    const tokenSize = sizeData.token ?? 1;

                    let effectData = {
                        name: effectName,
                        icon: 'icons/magic/movement/abstract-ribbons-red-orange.webp',
                        changes: [
                            {
                                key: 'system.traits.size',
                                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value: `${size}`,
                                priority: 22
                            },
                            {
                                key: 'ATL.width',
                                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value: `${tokenSize}`,
                                priority: 23
                            },
                            {
                                key: 'ATL.height',
                                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value: `${tokenSize}`,
                                priority: 24
                            }
                        ],
                        origin: originUuid,
                        disabled: false
                    };

                    if (extraChanges) {
                        for (let extra of extraChanges) {
                            effectData.changes.push(extra);
                        }
                    }

                    return await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
                }
            }
            else {
                console.error(`resizeActor() called for ${actor.name} lacking a size attribute`);
            }
        }
        else {
            console.error(`resizeActor() called for ${actor.name} with same size: ${size}`);
        }
    }

    static async enchantItem(item, effectData, {effects = [], items = [], concentrationItem, parentEntity} = {}) {
        foundry.utils.setProperty(effectData, 'type', 'enchantment');
        effectData.transfer = false;
        foundry.utils.setProperty(effectData, 'flags.dnd5e.enchantment', {
            level: {
                min: null,
                max: null
            },
            riders: {
                effect: effects,
                item: items
            }
        });

        let effectList = await item.createEmbeddedDocuments('ActiveEffect', [effectData]);
        if (effectList && effectList.length > 0) {
            const enchantEffect = effects[0];
            await HomebrewEffects.addDependent(parentEntity, enchantEffect);
        }
    }

    static async addDependent(entity, dependent) {
        let hasPermission = game.user.testUserPermission(entity, "OWNER");
        if (hasPermission) {
            await entity.addDependent(dependent);
        } else {
            await MidiQOL.socket().executeAsGM('addDependent', {concentrationEffectUuid: entity.uuid, dependentUuid: dependent.uuid});
        }
    }

}
