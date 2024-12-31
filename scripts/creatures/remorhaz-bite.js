/*
    If the target is a creature, it is grappled (escape DC 17). Until this grapple ends, the target is restrained, and
    the remorhaz can't bite another target.

    The remorhaz makes one bite attack against a Medium or smaller creature it is grappling. If the attack hits, that
    creature takes the bite's damage and is swallowed, and the grapple ends. While swallowed, the creature is blinded
    and restrained, it has total cover against attacks and other effects outside the remorhaz, and it takes 21 (6d6)
    acid damage at the start of each of the remorhaz's turns.

*/
const version = "12.3.0";
const optionName = "Remorhaz Bite";

try {
    const targetToken = workflow.hitTargets.first();
    if (args[0].macroPass === "postActiveEffects" && targetToken) {
        // see if this target is already grappled
        let grappledEffect = HomebrewHelpers.findEffect(targetToken.actor, 'Grappled', item.uuid);
        if (grappledEffect) {
            // swallow
            // check the size
            const tsize = targetToken.actor.system.traits.size;
            if (["tiny", "sm", "med"].includes(tsize)) {
                let effectData = {
                    name: 'Swallowed',
                    icon: 'icons/creatures/abilities/mouth-teeth-tongue-purple.webp',
                    changes: [
                        {
                            key: 'flags.midi-qol.disadvantage.attack.all',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: true,
                            priority: 20
                        },
                        {
                            key: 'flags.midi-qol.grants.attack.fail.all',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: true,
                            priority: 21
                        },
                        {
                            key: 'flags.midi-qol.disadvantage.ability.save.dex',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: true,
                            priority: 22
                        },
                        {
                            key: 'system.attributes.movement.all',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: 0,
                            priority: 23
                        },
                        {
                            key: 'flags.midi-qol.neverTarget',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: true,
                            priority: 24
                        },
                        {
                            key: 'ATL.hidden',
                            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            value: true,
                            priority: 25
                        },
                        {
                            key: 'flags.midi-qol.OverTime',
                            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            value: 'turn=start, label=Stomach Acid, damageRoll=6d6, damageType=acid, rollMode=publicroll',
                            priority: 26
                        }
                    ],
                    statuses: [
                        'blinded', 'restrained'
                    ],
                    flags: {
                        dae: {
                            specialDuration: ['shortRest', 'longRest', 'combatEnd']
                        }
                    },
                    origin: workflow.item.uuid,
                    disabled: false
                };

                ChatMessage.create({
                    content: `${actor.name} swallows ${targetToken.name}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });

                await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: targetToken.actor.uuid,
                    effects: [grappledEffect.id]
                });

                return await MidiQOL.socket().executeAsGM("createEffects",
                    {actorUuid: targetToken.actor.uuid, effects: [effectData]});

            }
        }
        else {
            await HomebrewEffects.applyGrappledEffect(targetToken.actor, item, 17, undefined, undefined, true);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
