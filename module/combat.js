const _flagGroup = "fvtt-trazzm-homebrew-5e";

async function legendaryActionsPrompt(combat, data, options, id) {
    // store the prior combatant id
    const lastCombatantId = combat.previous?.combatantId;

    // Is this an attempt to move combat forward?
    if (options.direction === 1) {
        // Have we already prompted this turn?
        let lastPrompt = combat.flags[_flagGroup]?.lastPrompt;
        let currentCombat = combat.current;
        if (lastPrompt?.round === currentCombat.round && lastPrompt?.turn === currentCombat.turn) return;

        let legendaryCombatants = filterForLegendaryActions(combat);
        if (legendaryCombatants && legendaryCombatants.length > 0) {
            let legendaryActionData = new Map();

            for (let legendaryData of legendaryCombatants) {
                if (legendaryData.combatant.id !== lastCombatantId) {
                    let usesLeft = legendaryData.legendaryResource.value ?? 0;

                    if (usesLeft > 0) {
                        // get the available legendary actions with a cost the actor can pay
                        let combatantItems = legendaryData.combatant.actor.identifiedItems;
                        let legendaryOptions = [];
                        combatantItems.forEach(i => i.forEach(j => {
                            if (j.system.activities?.find(k => {
                                return (k?.consumption?.targets[0]?.target === 'resources.legact.value' || k?.activation.type === 'legendary') &&
                                    legendaryData.combatant.actor?.system.resources?.legact?.value >= k.activation?.value;
                            })) {
                                legendaryOptions.push(j);
                            }
                        }));

                        if (legendaryOptions && legendaryOptions.length > 0) {
                            let legendaryParams = {
                                "combatant": legendaryData.combatant,
                                "actionPoints": usesLeft,
                                "actions": legendaryOptions
                            }

                            // get the player to prompt
                            let playerId;
                            let player = MidiQOL.playerForActor(legendaryData.combatant.actor);
                            if (player && player.active) {
                                playerId = player.id;
                            } else {
                                playerId = game.users.activeGM.id;
                            }

                            if (playerId) {
                                if (legendaryActionData.has(playerId)) {
                                    let data = legendaryActionData.get(playerId);
                                    data.push(legendaryParams);
                                    legendaryActionData.set(playerId, data);
                                } else {
                                    legendaryActionData.set(playerId, [legendaryParams]);
                                }
                            }
                        } else {
                            console.log("Legendary actions skipped for: " + legendaryData.combatant.name + " -- no options available this turn");
                        }
                    } else {
                        console.log("Legendary actions skipped for: " + legendaryData.combatant.name + " -- no uses left");
                    }
                }
            }

            await combat.setFlag(_flagGroup, 'lastPrompt', {
                round: combat.current.round,
                turn: combat.current.turn
            });

            legendaryActionData.forEach(async function (value, key) {
                await game.trazzm.socket.executeAsUser("doLegendaryAction", key, value);
            });

            // After notifying of all legendary actions available, check for recharge of the current combatant
            await HomebrewHelpers.rechargeLegendaryActions(combat?.combatant?.actor);
        }
    }
}

function filterForLegendaryActions(combat) {
    let result = [];

    if (combat) {
        for (let combatant of combat.combatants) {
            // skip dead combatants
            const hpValue = foundry.utils.getProperty(combatant.actor, 'system.attributes.hp.value');
            if (!hpValue || hpValue < 1) continue;

            let legendaryResource = foundry.utils.getProperty(combatant.actor, 'system.resources.legact');
            if (legendaryResource && legendaryResource.max > 0) {
                result.push({combatant: combatant, legendaryResource: legendaryResource});
            }
        }
    }

    return result;
}

export let combat = {
    legendaryActionsPrompt
};
