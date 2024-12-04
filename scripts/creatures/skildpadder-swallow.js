/*
    The Skildpadder makes one bite attack against a Large or smaller target it is grappling. If the attack hits, the
    target is also swallowed and the grapple ends. While swallowed, the creature is Blinded and Restrained, it has total
    cover against attacks and other effects outside the Skildpadder, and it takes 21 (6d6) acid damage at the start of
    each of the Skildpadder's turns.

    If the Skildpadder takes more than 30 damage on a single turn from a creature inside it, the Skildpadder must succeed on
    a DC 23 Constitution saving throw at the end of the turn or regurgitate all swallowed creatures, which all fall
    Prone in a space within 10 feet of the Skildpadder. If the Skildpadder dies, a swallowed creature is no longer
    restrained by it and can escape from the corpse using 15 feet of movement, exiting prone.
 */
const version = "12.3.0";
const optionName = "Swallow";

try {
    if (args[0].macroPass === "preItemRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            const grappledEffects = targetToken.actor.getRollData().effects.filter(e => e.name === 'Grappled');
            if (grappledEffects.length > 0) {
                for (let grapple of grappledEffects) {
                    let foundItem = actor.items.find(i => i.uuid === grapple.origin);
                    if (foundItem) {
                        return true;
                    }
                }
            }
        }

        ui.notifications.error(`${optionName}: the target is not eligible to be swallowed`);
        return false;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // check the size
            const tsize = targetToken.actor.system.traits.size;
            if (["tiny", "sm", "med", "lg"].includes(tsize)) {
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
                            value: 'turn=start, label=Stomach Acid, damageRoll=6d6, damageType=acid',
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

                return await MidiQOL.socket().executeAsGM("createEffects",
                    {actorUuid: targetToken.actor.uuid, effects: [effectData]});
            }
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
