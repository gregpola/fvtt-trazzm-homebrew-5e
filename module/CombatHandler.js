import {socket} from "./module.js";
import {handleRegeneration, checkForRegeneration, applyDamageTypes} from "./regeneration.js";

const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _zombieId = "UBlzKwy8bHtN42NQ";
const _theDeadWalkFlag = "the-dead-walk";

export class CombatHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering CombatHandler");
        CombatHandler.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.preRollInitiative", (actor, roll) => {
        });

        Hooks.on("dnd5e.rollInitiative", async (actor, combatants) => {
        });

        Hooks.on("deleteCombat", async (combat) => {
            // let tokens = combat.combatants.map(c => c.token);
            //
            // // remove temporary mutations related to combat
            // for (let token of tokens) {
            //     const escapeGrapple = actor.items.find(i => i.name === "Escape Grapple");
            //     if (escapeGrapple) {
            //         escapeGrapple.delete();
            //     }
            //
            //     const breakFree = actor.items.find(i => i.name === "Break Free");
            //     if (breakFree) {
            //         breakFree.delete();
            //     }
            // }
        });

        Hooks.on("updateCombat", async (combat, update, context, userId) => {
            if (!combat?.combatant?.isOwner) {
                console.log("updateCombat - not owner")
                return;
            }

            // no use cases for backwards change
            if (context.direction < 1) {
                console.log("updateCombat - skipped - backwards")
                return;
            }

            // store the prior combatant id
            const lastCombatantId = combat.previous?.combatantId;

            // first handle legendary actions, since they happen at the end of the prior combatant's turn
            let legendaryCombatants = CombatHandler.filterForLegendaryActions(combat);
            if (legendaryCombatants && legendaryCombatants.length > 0) {
                let legendaryActionData = new Map();

                for (let legendaryData of legendaryCombatants) {
                    if (legendaryData.combatant.id !== lastCombatantId) {
                        let usesLeft = legendaryData.legendaryResource.value ?? 0;

                        if (usesLeft > 0) {
                            // get the available legendary actions with a cost the actor can pay
                            let legendaryOptions = legendaryData.combatant.actor.items.filter(i => i.system.activation.type === 'legendary' && i.system.activation.cost <= usesLeft);
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
                                }
                                else {
                                    playerId = game.users.activeGM.id;
                                }

                                if (playerId) {
                                    if (legendaryActionData.has(playerId)) {
                                        let data = legendaryActionData.get(playerId);
                                        data.push(legendaryParams);
                                        legendaryActionData.set(playerId, data);
                                    }
                                    else {
                                        legendaryActionData.set(playerId, [legendaryParams]);
                                    }
                                }
                            }
                            else {
                                console.log("Legendary actions skipped for: " + legendaryData.combatant.name + " -- no options available this turn");
                            }
                        }
                        else {
                            console.log("Legendary actions skipped for: " + legendaryData.combatant.name + " -- no uses left");
                        }
                    }
                }

                legendaryActionData.forEach(async function(value, key) {
                    await socket.executeAsUser("doLegendaryAction", key, value);
                });

                // After notifying of all legendary actions available, check for recharge of the current combatant
                await HomebrewHelpers.rechargeLegendaryActions(combat?.combatant?.actor);
            }

            // check for any turn start options
            let turnStartOptions = await CombatHandler.hasTurnStartOption(combat?.combatant);
            if (turnStartOptions) {
                // get the player to prompt
                let player = MidiQOL.playerForActor(combat.combatant.actor);
                if (player && player.active) {
                    await socket.executeAsUser("doTurnStartOptions", player.id, combat.combatant.actor.uuid, turnStartOptions);
                }
                else {game.users?.activeGM
                    await socket.executeAsUser("doTurnStartOptions", game.users.activeGM.id, combat.combatant.actor.uuid, turnStartOptions);
                }
            }

            let actor = combat?.combatant?.actor;
            if (actor) {
                // check for regeneration
                await checkForRegeneration(actor);
                await handleRegeneration(combat, update, context);

                // check for The Dead Walk
                let theDeadWalkFlag = actor.getFlag(_flagGroup, _theDeadWalkFlag);
                if (theDeadWalkFlag) {
                    await actor.unsetFlag(_flagGroup, _theDeadWalkFlag);
                    await CombatHandler.transformToZombie(combat.combatant);
                }
            }
        });

        Hooks.on("preUpdateActor", async (actor, change, options, user) => {
            if (!actor.isOwner) {
                console.log("preUpdateActor - not owner")
                return;
            }

            const isHealth = hasProperty(change, "system.attributes.hp.value");
            if (isHealth) {
                const hpValue = change.system.attributes.hp.value;
                const isaBoar = actor.name === "Boar";
                const isaGiantBoar = actor.name === "Giant Boar";
                const relentless = actor.items.getName("Relentless");
                const appliedDamage = options.damageItem?.appliedDamage ?? 0;

                // Check for Boar Relentless
                // If the boar takes 7 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead.
                // Only usable once per rest
                if (relentless && appliedDamage && relentless.system.uses?.value) {
                    if (isaBoar && (hpValue <= 0) && (appliedDamage <= 7)) {
                        foundry.utils.setProperty(change, "system.attributes.hp.value", 1);
                        await relentless.update({"system.uses.value": 0});

                        ChatMessage.create({
                            speaker: {alias: actor.name},
                            content: actor.name + " is relentless"
                        });
                    } else if (isaGiantBoar && (hpValue <= 0) && (appliedDamage <= 10)) {
                        foundry.utils.setProperty(change, "system.attributes.hp.value", 1);
                        await relentless.update({"system.uses.value": 0});

                        ChatMessage.create({
                            speaker: {alias: actor.name},
                            content: actor.name + " is relentless"
                        });
                    } else if ((actor.name === "Gorthok the Thunder Boar") && (hpValue <= 0) && (appliedDamage <= 27)) {
                        foundry.utils.setProperty(change, "system.attributes.hp.value", 1);
                        await relentless.update({"system.uses.value": 0});

                        ChatMessage.create({
                            speaker: {alias: actor.name},
                            content: actor.name + " is relentless"
                        });
                    }
                }

                // Check for Orc Relentless Endurance
                const relentlessEndurance = actor.items.getName("Relentless Endurance");
                if (relentlessEndurance && appliedDamage && relentlessEndurance.system.uses?.value) {
                    if (hpValue <= 0) {
                        foundry.utils.setProperty(change, "system.attributes.hp.value", 1);
                        const newUses = relentlessEndurance.system.uses?.value - 1;
                        await relentlessEndurance.update({"system.uses.value": newUses});

                        ChatMessage.create({
                            speaker: {alias: actor.name},
                            content: actor.name + " shrugs off death!"
                        });
                    }
                }
            }
        });

        Hooks.on("updateActor", async (actor, change, options, user) => {
            if (!actor.isOwner) {
                console.log("updateActor - not owner")
                return;
            }

            // special death handling
            const hpUpdate = getProperty(change, "system.attributes.hp.value");
            if (hpUpdate !== undefined) {
                if (hpUpdate <= 0) {
                    // look for the death of an actor that is grappling and/or restraining an actor
                    let tokens = canvas.scene.tokens;
                    for (let token of tokens) {
                        let existingGrappled = token.actor.getRollData().effects.find(eff => eff.name === 'Grappled' && eff.origin === actor.uuid);
                        if (existingGrappled) {
                            await MidiQOL.socket().executeAsGM('removeEffects', {
                                actorUuid: token.actor.uuid,
                                effects: [existingGrappled.id]
                            });

                            const escapeGrapple = token.actor.items.find(i => i.name === "Escape Grapple");
                            if (escapeGrapple) {
                                escapeGrapple.delete();
                            }
                        }

                        let existingRestrained = token.actor.getRollData().effects.find(eff => eff.name === 'Restrained' && eff.origin === actor.uuid);
                        if (existingRestrained) {
                            await MidiQOL.socket().executeAsGM('removeEffects', {
                                actorUuid: token.actor.uuid,
                                effects: [existingRestrained.id]
                            });

                            const breakFree = token.actor.items.find(i => i.name === "Break Free");
                            if (breakFree) {
                                breakFree.delete();
                            }
                        }
                    }

                    // check for The Dead Walk handling
                    let theDeadWalk = game.settings.get(_flagGroup, "dead-walk");
                    if (theDeadWalk) {
                        const actorType = actor.system.details.type;

                        if (actorType && actorType.value.toLowerCase() === "humanoid") {
                            let riseAsZombieRoll = await new Roll('1d100').evaluate({async: false});
                            //await game.dice3d?.showForRoll(riseAsZombieRoll, game.user, true);
                            if (riseAsZombieRoll.total < 26) {
                                console.info(`${actor.name} will rise as a zombie next round`);
                                // add flag to the actor, so that is rises as a Zombie next turn
                                await actor.setFlag(_flagGroup, _theDeadWalkFlag, actor.uuid);
                            }
                            else {
                                console.info("%c fvtt-trazzm-homebrew-5e", "color: #DE7554", " | The Dead Walk - failed roll");
                            }
                        }
                    }
                }

                // Check for regeneration impact
                await applyDamageTypes(actor, change, options);
            }
        });

        Hooks.on("combatStart", async (combat, delta) => {
            let tokens = combat.combatants.map(c => c.token);

            // look for supported features in the combatants
            for (let token of tokens) {
                //let actor = token.actor;
            }
        });

        Hooks.on("updateItem", async(item, updates, options, userId) => {
            const actor = item.actor;
            if ((item.type === 'weapon' || item.type === 'equipment') && actor) {
                // Handle dual wielder feat
                const dualWielderFeat = actor.items.find(i => i.name === "Dual Wielder");
                if (dualWielderFeat) {
                    const acBonusEffect = dualWielderFeat.effects.find(i => i.name === "Dual Wielder AC Bonus");
                    if (!acBonusEffect) {
                        console.log('Dual Wielder - no AC bonus effect found');
                    }
                    else {
                        let getsACBonus = true;
                        let currentWeapons = actor.items.filter(i => (i.type === `weapon`) && i.system.equipped && i.system.actionType === "mwak");
                        if (currentWeapons.length < 2) {
                            console.log('Dual Wielder - no AC bonus, not enough weapons equipped');
                            getsACBonus = false;
                        }

                        if (currentWeapons.length > 2) {
                            console.log('Dual Wielder - no AC bonus, too many weapons equipped');
                            getsACBonus = false;
                        }

                        // check for two-handed weapons
                        if ((currentWeapons[0] && currentWeapons[0].system.properties.has('two')) || (currentWeapons[1] && currentWeapons[1].system.properties.has('two'))) {
                            console.log('Dual Wielder - no AC bonus, weapon is two handed');
                            getsACBonus = false;
                        }

                        // check for a shield equipped
                        let shields = actor.items.filter(i => i.system.armor?.type === 'shield' && i.system.equipped);
                        if (shields.length) {
                            console.log('Dual Wielder - no AC bonus, a shield is equipped');
                            getsACBonus = false;
                        }

                        if (getsACBonus) {
                            acBonusEffect.update({'disabled': false});
                        }
                        else {
                            acBonusEffect.update({'disabled': true});
                        }
                    }
                }
            }
        });
    }

    static async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Check the combatant for any turn start options that should be presented.
     *
     * @param combatant
     */
    static async hasTurnStartOption(combatant) {
        if (combatant) {
            // Check for prone condition and ask if they want to stand up. We automate this because it is a commonly
            // missed condition that results in confusion about the actor's actions, such as having disadvantage on attacks
            const actor = combatant.actor;
            if (actor) {
                const hp = actor.system.attributes.hp.value;
                let isProne = MidiQOL.hasCondition(actor, "Prone");
                const isDead = MidiQOL.hasCondition(actor, "Dead");
                const isUnconscious = MidiQOL.hasCondition(actor, "Unconscious");
                const isIncapacitated = MidiQOL.hasCondition(actor, "Incapacitated");
                const isParalyzed = MidiQOL.hasCondition(actor, "Paralyzed");
                const isPetrified = MidiQOL.hasCondition(actor, "Petrified");
                const isStunned = MidiQOL.hasCondition(actor, "Stunned");

                // prone conditionals
                let laughterEffect =  actor.getRollData().effects.find(eff => eff.name.toLowerCase().includes('hideous laughter'));
                if (isProne && laughterEffect) {
                    isProne = false;
                }

                if ((hp > 0) && isProne && !isDead && !isUnconscious && !isIncapacitated && !isParalyzed && !isPetrified && !isStunned) {
                    return {
                        "combatant": combatant,
                        "hp": hp,
                        "prone": isProne,
                        "dead": isDead,
                        "unconscious": isUnconscious,
                        "incapacitated": isIncapacitated,
                        "paralyzed": isParalyzed,
                        "petrified": isPetrified,
                        "stunned": isStunned
                    };
                }
            }
        }

        return undefined;
    }

    static filterForLegendaryActions(combat) {
        let result = [];

        if (combat) {
            for (let combatant of combat.combatants) {
                // skip dead combatants
                const hpValue = getProperty(combatant.actor, 'system.attributes.hp.value');
                if (!hpValue || hpValue < 1) continue;

                let legendaryResource = getProperty(combatant.actor, 'system.resources.legact');
                if (legendaryResource && legendaryResource.max > 0) {
                    result.push({combatant: combatant, legendaryResource: legendaryResource});
                }
            }
        }

        return result;
    }

    static async transformToZombie(combatant) {
        let zombieActorName = "Zombie (" + combatant.actor.name + "-" + combatant.actor.id + ")";

        let updates = {
            token: {
                "name": zombieActorName,
                "disposition": CONST.TOKEN_DISPOSITIONS.HOSTILE,
                "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                "bar1": { attribute: "attributes.hp" },
                "actorLink": false
            },
            "name": zombieActorName
        };

        let zombieActor = game.actors.getName(zombieActorName);
        if (!zombieActor) {
            // Get from the compendium
            let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + _zombieId);
            if (!entity) {
                ui.notifications.error("The Dead Walk - unable to find the zombie actor");
                return;
            }

            // import the actor
            let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), _zombieId, updates);
            if (!document) {
                ui.notifications.error("The Dead Walk - unable to import the zombie actor from the compendium");
                return;
            }
            zombieActor = game.actors.getName(zombieActorName);
        }

        if (zombieActor) {
            let tok = canvas.tokens.get(combatant.tokenId);
            if (!tok) {
                tok = canvas.scene.tokens.find(t => t.actor.id === combatant.actor.id);
                if (!tok || !tok.document) {
                    ui.notifications.error("The Dead Walk - unable to find the source token");
                    return;
                }
            }

            // transform the actor
            await new Portal()
                .origin(token)
                .addCreature(zombieActor)
                .transform();
            await CombatHandler.wait(500);
            ChatMessage.create({
                speaker: {alias: combatant.actor.name},
                content: combatant.actor.name + " rises as a zombie"
            });
        }
    }
}
