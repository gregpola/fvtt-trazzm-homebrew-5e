/*
    Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 6 (1d6 + 3) bludgeoning damage, and the darkmantle
    attaches to the target. If the target is Medium or smaller and the darkmantle has advantage on the attack roll, it
    attaches by engulfing the target’s head, and the target is also blinded and unable to breathe while the darkmantle
    is attached in this way.

    While attached to the target, the darkmantle can attack no other creature except the target but has advantage on its
    attack rolls. The darkmantle’s speed also becomes 0, it can’t benefit from any bonus to its speed, and it moves with the target.

    A creature can detach the darkmantle by making a successful DC 13 Strength check as an action. On its turn, the
    darkmantle can detach itself from the target by using 5 feet of movement.
 */
const version = "12.3.0";
const optionName = "Darkmantle Crush";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "darkmantle-crush";

try {
    if (args[0].macroPass === "preAttackRoll") {
        const target = workflow.targets.first();
        if (target) {
            let attachedEffect = target.actor.getRollData().effects.find(eff => eff.name === 'Darkmantle Attached' && eff.origin === workflow.item.uuid);
            if (attachedEffect) {
                workflow.advantage = true;
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            let attachedEffect = targetToken.actor.getRollData().effects.find(eff => eff.name === 'Darkmantle Attached' && eff.origin === workflow.item.uuid);
            if (attachedEffect) {
                console.log(`${optionName} - already attached`);
                return;
            }

            const attachToHead = ["tiny", "sm", "med"].includes(targetToken.actor.system.traits.size) && workflow.advantage;
            await tokenAttacher.attachElementToToken(token, targetToken, true);
            await tokenAttacher.setElementsLockStatus(token, false, true);

            let attachedEffectData = {
                name: 'Darkmantle Attached',
                icon: 'icons/magic/earth/strike-fist-stone-gray.webp',
                changes: [
                    {
                        key: 'macro.createItem',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.BALDs15AF2Guoyc4',
                        priority: 20
                    }
                ],
                statuses: [
                ],
                flags: {
                    'fvtt-trazzm-homebrew-5e': {
                        'darkmantle-crush' : {
                            'checkdc': 13,
                            'checktype': 'str',
                            'tokenId': token.id
                        }
                    }
                },
                origin: workflow.item.uuid,
                disabled: false,
                transfer: true
            };

            if (attachToHead) {
                attachedEffectData.changes.push({
                    key: 'flags.midi-qol.fail.spell.vocal',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: true,
                    priority: 20
                });

                attachedEffectData.statuses.push("blinded");
                attachedEffectData.statuses.push("deafened");
                attachedEffectData.statuses.push("silenced");
            }

            await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [attachedEffectData]});
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
