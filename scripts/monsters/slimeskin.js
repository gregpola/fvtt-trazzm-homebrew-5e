/*
    The babau demon’s skin secretes an acidic slime. A creature that touches the demon or hits it with a melee attack
    while within 5 feet of it takes 4 (1d8) acid damage.

    Any nonmagical weapon made of metal or wood that hits the demon corrodes. After dealing damage, the weapon takes a
    permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical
    ammunition made of metal or wood that hits the demon is destroyed after dealing damage.
*/
const optionName = "Slimeskin";
const version = "13.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "msak"].includes(rolledActivity.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);
            if (MidiQOL.computeDistance(attackerToken, token) <= 5) {
                let activity = macroItem.system.activities.find(a => a.identifier === 'slime-damage');
                // synthetic activity use
                if (activity) {
                    let targets = new Set();
                    targets.add(attackerToken);

                    const options = {
                        midiOptions: {
                            targetsToUse: targets,
                            noOnUseMacro: true,
                            configureDialog: false,
                            showFullCard: true,
                            ignoreUserTargets: true,
                            checkGMStatus: false,
                            autoRollAttack: true,
                            autoRollDamage: "always",
                            fastForwardAttack: true,
                            fastForwardDamage: true,
                            workflowData: true
                        }
                    };

                    await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                }
            }

            // damage the non-magical weapon
            if (rolledActivity.actionType === "mwak" && !rolledItem.system.properties.has('mgc')) {
                let slimeEffect = rolledItem.effects.find(e => e.name === 'Damaged by Slime');
                if (slimeEffect) {
                    // get the current penalty
                    const penaltyChange = slimeEffect.changes.find(change => change.key === 'system.bonuses.All-Damage');
                    if (penaltyChange) {
                        var oldPenalty = Number(penaltyChange.value);
                        const newPenalty = oldPenalty - 1;

                        if (newPenalty > -5) {
                            await slimeEffect.update({
                                changes: [{
                                    key: 'system.bonuses.All-Damage',
                                    value: `${newPenalty}`,
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    priority: 20
                                }]});
                        }
                        else {
                            await applyDamagePenaltyToActor(attacker, -5, macroItem.uuid);

                            // delete the item
                            await game.itempiles.API.removeItems(attacker, [{ item: rolledItem, quantity: 1 }]);
                            ChatMessage.create({
                                content: `${attacker.name}'s ${rolledItem.name} is destroyed!`,
                                speaker: ChatMessage.getSpeaker({actor: attacker})
                            });

                        }
                    }
                }
                else {
                    await applyDamagePenalty(rolledItem, -1, macroItem.uuid);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDamagePenalty(item, penalty, sourceItem) {
    let effectData = {
        name: 'Damaged by Slime',
        icon: 'icons/creatures/slimes/slime-movement-splash-green.webp',
        changes: [
            {
                key: 'system.bonuses.All-Damage',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: `${penalty}`,
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
        origin: sourceItem,
        duration: {
            seconds: null
        },
        disabled: false
    };

    await item.createEmbeddedDocuments("ActiveEffect", [effectData]);
}

async function applyDamagePenaltyToActor(actor, penalty, sourceItem) {
    let effectData = {
        name: 'Damaged by Slime',
        icon: 'icons/creatures/slimes/slime-movement-splash-green.webp',
        origin: sourceItem,
        type: "base",
        transfer: false,
        statuses: [],
        changes: [
            {
                'key': 'flags.automated-conditions-5e.damage.bonus',
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                'value': `bonus=${penalty}; once;`,
                'priority': 20
            }
        ],
        flags: {
            dae: {
                stackable: 'noneName',
                specialDuration: ['turnStartSource', 'DamageDealt', 'combatEnd']
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
