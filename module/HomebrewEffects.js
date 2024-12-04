const blindedName = 'Blinded';
const charmedName = 'Charmed';
const deafenedName = 'Deafened';
const etherealName = 'Ethereal';
const exhaustionName = 'Exhaustion';
const frightenedName = 'Frightened';
const grappledName = 'Grappled';
const incapacitatedName = 'Incapacitated';
const invisibleName = 'Invisible';
const paralyzedName = 'Paralyzed';
const petrifiedName = 'Petrified';
const poisonedName = 'Poisoned';
const proneName = 'Prone';
const restrainedName = 'Restrained';
const sleepingName = 'Sleeping';
const stunnedName = 'Stunned';
const unconsciousName = "Unconscious";

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
                if (!effect.flags.dae.autoCreated) {
                    for (let cond of conditions) {
                        if ((effect.name === cond) || effect.statuses.has(cond)) {
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

    static async applyBlindedEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === blindedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition blinded, already exists");
                return false;
            }

            let effectData = {
                name: blindedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/blinded.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    }
                ],
                statuses: [
                    'blinded'
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
                effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyCharmedEffect(actor, origin, specialDurations = undefined, seconds = undefined, extraStatuses = undefined, extraChanges = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === charmedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition charmed, already exists");
                return false;
            }

            let effectData = {
                name: charmedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/charmed.svg',
                changes: [
                ],
                statuses: [
                    'charmed'
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

            if (extraStatuses) {
                for (let extra of extraStatuses) {
                    effectData.statuses.push(extra);
                }
            }

            if (extraChanges) {
                for (let extra of extraChanges) {
                    effectData.changes.push(extra);
                }
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyDeafenedEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === deafenedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition deafened, already exists");
                return false;
            }

            let effectData = {
                name: deafenedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/deafened.svg',
                changes: [
                ],
                statuses: [
                    'deafened'
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

    static async applyExhaustionEffect(actor, origin, level, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === exhaustionName && eff.origin === originValue);
            if (existingExhaustion) {
                await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': [existingExhaustion.id]});
            }

            // add the exhaustion effect
            let effectData = {
                name: exhaustionName,
                icon: `modules/fvtt-trazzm-homebrew-5e/assets/effects/exhaustion${level}.svg`,
                changes: [
                    {
                        key: 'system.attributes.exhaustion',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: level,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.dnd5e.initiativeDisadv',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    }
                ],
                statuses: [
                    'exhaustion'
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

            if (seconds) {
                effectData.duration.seconds = seconds;
            }

            // add other levels
            if (level >= 2 && level < 5) {
                effectData.changes.push(
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: '/2',
                        priority: 23
                    }
                );
            }

            if (level >= 3) {
                effectData.changes.push(
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 24
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 25
                    }
                );
            }

            if (level >= 4) {
                effectData.changes.push(
                    {
                        key: 'system.attributes.hp.max',
                        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                        value: '0.5',
                        priority: 26
                    }
                );
            }

            if (level >= 5) {
                effectData.changes.push(
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 27
                    }
                );
            }

            if (level >= 6) {
                effectData.statuses.push('dead');
            }

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyFrightenedEffect(actor, origin, specialDurations = undefined, seconds = undefined, overtimeValue = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === frightenedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition frightened, already exists");
                return false;
            }

            let effectData = {
                name: frightenedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/frightened.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    }
                ],
                statuses: [
                    'frightened'
                ],
                flags: {
                    dae: {
                        specialDuration: ['shortRest', 'longRest']
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

            if (overtimeValue) {
                effectData.changes.push({
                    key: 'flags.midi-qol.OverTime',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: overtimeValue,
                    priority: 1
                });
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyGrappledEffect(actor, origin, escapeDC, specialDurations = undefined, seconds = undefined, restrained = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === grappledName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition grappled, already exists");
                return false;
            }

            let effectData = {
                name: grappledName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/grappled.svg',
                changes: [
                    {
                        key: 'macro.createItem',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.Rg4639o5lnxWKgWD',
                        priority: 20
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 21
                    }
                ],
                statuses: [
                    'grappled'
                ],
                flags: {
                    dae: {
                        specialDuration: ['shortRest', 'longRest', 'combatEnd']
                    },
                    'fvtt-trazzm-homebrew-5e': {
                        'grapple-escape-dc': escapeDC
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

            if (restrained) {
                effectData.statuses.push('restrained');

                effectData.changes.push(
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    });

                effectData.changes.push(
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 23
                    });

                effectData.changes.push(
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 24
                    });
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyIncapacitatedEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === incapacitatedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition incapacitated, already exists");
                return false;
            }

            let effectData = {
                name: incapacitatedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/incapacitated.svg',
                changes: [
                ],
                statuses: [
                    'incapacitated'
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

    static async applyInvisibleEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === invisibleName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition invisible, already exists");
                return false;
            }

            let effectData = {
                name: invisibleName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/invisible.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.grants.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    }
                ],
                statuses: [
                    'invisible'
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

    static async applyParalyzedEffect(actor, origin, specialDurations = undefined, seconds = undefined, overtimeValue = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === paralyzedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition paralyzed, already exists");
                return false;
            }

            let effectData = {
                name: paralyzedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/paralyzed.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.fail.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.fail.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'flags.midi-qol.grants.critical.range',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: 5,
                        priority: 23
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 24
                    },
                    {
                        key: 'flags.midi-qol.fail.spell.vocal',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: true,
                        priority: 25
                    }
                ],
                statuses: [
                    'paralyzed'
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

            if (overtimeValue) {
                effectData.changes.push({
                    key: 'flags.midi-qol.OverTime',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: overtimeValue,
                    priority: 1
                });
            }

            return await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
        }

        return undefined;
    }

    static async applyPetrifiedEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === petrifiedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition petrified, already exists");
                return false;
            }

            let effectData = {
                name: petrifiedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/petrified.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.fail.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.fail.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'system.traits.dr.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 23
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 24
                    },
                    {
                        key: 'system.traits.di.value',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: 'Poison',
                        priority: 25
                    }
                ],
                statuses: [
                    'petrified'
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

    static async applyPoisonedEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
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
                name: poisonedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/poisoned.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    }
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

    static async applyProneEffect(actor, origin, specialDurations = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === proneName);
            if (existing) {
                console.log("HomebrewEffects - not applying condition prone, already exists");
                return false;
            }

            let effectData = {
                name: proneName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/prone.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: '/2',
                        priority: 22
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.msak',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 23
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.mwak',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 24
                    },
                    {
                        key: 'flags.midi-qol.grants.disadvantage.attack.rsak',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 25
                    },
                    {
                        key: 'flags.midi-qol.grants.disadvantage.attack.rwak',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 26
                    },

                ],
                statuses: [
                    'prone'
                ],
                flags: {
                    dae: {
                        specialDuration: []
                    }
                },
                origin: originValue,
                disabled: false
            };

            if (specialDurations) {
                effectData.flags.dae.specialDuration = effectData.flags.dae.specialDuration.concat(specialDurations);
            }

            const appliedEffect = await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: actor.uuid, effects: [effectData]});
            return appliedEffect;
        }

        return undefined;
    }

    static async applyRestrainedEffect(actor, origin, escapeDC, abilityCheck, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === restrainedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition restrained, already exists");
                return false;
            }

            let effectData = {
                name: restrainedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/restrained.svg',
                changes: [
                    {
                        key: 'macro.createItem',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.NrqmZlBf9GwcERs6',
                        priority: 19
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 23
                    }
                ],
                statuses: [
                    'restrained'
                ],
                flags: {
                    dae: {
                        specialDuration: ['shortRest', 'longRest', 'combatEnd']
                    },
                    'fvtt-trazzm-homebrew-5e': {
                        'restrained-escape-dc': escapeDC,
                        'restrained-escape-skill': abilityCheck
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

    /**
     * Adds the sleeping effect to an existing effect data
     *
     * @param effectData
     */
    static addSleepingEffect(effectData) {
        if (effectData) {
            // TODO implement
        }
    }

    static async applySleepingEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === sleepingName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition sleeping, already exists");
                return false;
            }

            let sleepingEffect = {
                name: sleepingName,
                icon: 'icons/svg/sleep.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.fail.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.fail.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'flags.midi-qol.grants.critical.range',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: 5,
                        priority: 23
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 24
                    }
                ],
                statuses: [
                    'sleeping'
                ],
                flags: {
                    'dae': {
                        'specialDuration': ['shortRest', 'longRest', 'isDamaged']
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
                {actorUuid: actor.uuid, effects: [sleepingEffect]});
        }

        return undefined;
    }

    static async applyStunnedEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === stunnedName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition stunned, already exists");
                return false;
            }

            let effectData = {
                name: stunnedName,
                icon: 'modules/fvtt-trazzm-homebrew-5e/assets/effects/stunned.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.fail.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.fail.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 24
                    }
                ],
                statuses: [
                    'stunned'
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

    static async applyUnconsciousEffect(actor, origin, specialDurations = undefined, seconds = undefined) {
        if (actor) {
            const originValue = typeof origin === "string" ? origin : origin.uuid;
            const existing = actor.getRollData().effects.find(eff => eff.name === unconsciousName && eff.origin === originValue);
            if (existing) {
                console.log("HomebrewEffects - not applying condition unconscious, already exists");
                return false;
            }

            let effectData = {
                name: unconsciousName,
                icon: 'icons/svg/unconscious.svg',
                changes: [
                    {
                        key: 'flags.midi-qol.fail.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.fail.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 21
                    },
                    {
                        key: 'flags.midi-qol.grants.advantage.attack.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 22
                    },
                    {
                        key: 'flags.midi-qol.grants.critical.range',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: 5,
                        priority: 23
                    },
                    {
                        key: 'system.attributes.movement.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 0,
                        priority: 24
                    }
                ],
                statuses: [
                    'unconscious'
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

}
