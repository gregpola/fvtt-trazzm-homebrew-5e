import {socket} from "./module.js";
import {playerForActor} from "./utils.js";
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
            let tokens = combat.combatants.map(c => c.token);

            // remove temporary mutations related to combat
            for (let token of tokens) {
                await warpgate.revert(token, 'Escape Grapple');
                await warpgate.revert(token, 'Break Free');
            }
        });

        Hooks.on("updateCombat", async (combat, update, context, userId) => {
            if (!combat?.combatant?.isOwner) {
                console.log("updateCombat - not owner")
                return;
            }

            // check for any turn start options
            let turnStartOptions = await CombatHandler.hasTurnStartOption(combat?.combatant);
            if (turnStartOptions) {
                // get the player to prompt
                let player = playerForActor(combat.combatant.actor);
                if (player)
                    await socket.executeAsUser("doTurnStartOptions", player.id, combat.combatant.actor.uuid, turnStartOptions);
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
                    }
                }
            }
        });

        Hooks.on("updateActor", async (actor, change, options, user) => {
            // special death handling
            const hpUpdate = getProperty(change, "system.attributes.hp.value");
            if (hpUpdate !== undefined) {
                if (hpUpdate <= 0) {
                    // look for the death of an actor that is grappling and/or restraining an actor
                    let tokens = canvas.scene.tokens;
                    for (let token of tokens) {
                        let existingGrappled = token.actor.effects.find(eff => eff.name === 'Grappled' && eff.origin === actor.uuid);
                        if (existingGrappled) {
                            await MidiQOL.socket().executeAsGM('removeEffects', {
                                actorUuid: token.actor.uuid,
                                effects: [existingGrappled.id]
                            });
                            await warpgate.revert(token, 'Escape Grapple');
                        }

                        let existingRestrained = token.actor.effects.find(eff => eff.name === 'Restrained' && eff.origin === actor.uuid);
                        if (existingRestrained) {
                            await MidiQOL.socket().executeAsGM('removeEffects', {
                                actorUuid: token.actor.uuid,
                                effects: [existingRestrained.id]
                            });
                            await warpgate.revert(token, 'Break Free');
                        }
                    }

                    // check for The Dead Walk handling
                    let theDeadWalk = game.settings.get("fvtt-trazzm-homebrew-5e", "dead-walk");
                    if (theDeadWalk) {
                        const actorType = actor.system.details.type;

                        if (actorType && actorType.value.toLowerCase() === "humanoid") {
                            let riseAsZombieRoll = await new Roll('1d100').evaluate({async: false});
                            //await game.dice3d?.showForRoll(riseAsZombieRoll, game.user, true);
                            if (riseAsZombieRoll.total < 26) {
                                console.info(`${actor.name} will rise as a zombie next round`);
                                // add flag to the actor, so that is rises as a Zombie next turn
                                await actor.setFlag("fvtt-trazzm-homebrew-5e", _theDeadWalkFlag, actor.uuid);
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
                let actor = token.actor;
                let usesValue;

                // look for relentless
                let featureItem = actor?.items?.getName("Relentless");
                if (featureItem) {
                    usesValue = featureItem.system.uses?.value;
                    if (usesValue && usesValue < 1) {
                        await featureItem.update({"system.uses.value": 1});
                    }
                }

                // Look for Perfect Self
                featureItem = actor?.items?.getName("Perfect Self");
                if (featureItem) {
                    // At 20th level, when you roll for initiative and have no ki points remaining, you regain 4 ki points.
                    let kiFeature = actor.items.find(i => i.name === "Ki");
                    if (kiFeature) {
                        let usesLeft = kiFeature.system.uses?.value ?? 0;
                        if (!usesLeft || usesLeft < 1) {
                            await kiFeature.update({"system.uses.value": 4});

                        }
                    }
                }

                // Look for Superior Inspiration
                featureItem = actor?.items?.getName("Superior Inspiration");
                if (featureItem) {
                    // At 20th level, when you roll initiative and have no uses of Bardic Inspiration left, you regain one use.
                    let bardicInspiration = actor.items.find(i => i.name === "Bardic Inspiration");
                    if (bardicInspiration) {
                        let usesLeft = bardicInspiration.system.uses?.value ?? 0;
                        if (!usesLeft || usesLeft < 1) {
                            await bardicInspiration.update({"system.uses.value": 1});

                        }
                    }
                }

                // Look for Second Chance
                featureItem = actor?.items?.getName("Second Chance");
                if (featureItem) {
                    // Once you use this ability, you can’t use it again until you roll initiative at the start of combat or until you finish a short or long rest.
                    // if this check fails, something is wrong with the feature setup
                    if (featureItem.system.uses) {
                        let uses = featureItem.system.uses.value ?? 0;
                        if (!uses) {
                            await featureItem.update({"system.uses.value": 1});
                            await CombatHandler.wait(500);
                        }
                    }
                }

                // Look for Dread Ambusher
                featureItem = actor?.items?.getName("Dread Ambusher");
                if (featureItem) {
                    let newEffects = [];
                    const featureOrigin = actor.uuid; // ????

                    // Movement bonus effect
                    const movementBonusEffect = {
                        label: "Dread Ambusher - Movement Bonus",
                        icon: "icons/skills/movement/feet-winged-boots-brown.webp",
                        origin: featureOrigin,
                        changes: [
                            {
                                key: 'system.attributes.movement.walk',
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 10,
                                priority: 20
                            }
                        ],
                        flags: {
                            dae: {
                                selfTarget: false,
                                stackable: "none",
                                durationExpression: "",
                                macroRepeat: "none",
                                specialDuration: [
                                    "turnStartSource"
                                ],
                                transfer: false
                            }
                        },
                        disabled: false
                    };
                    newEffects.push(movementBonusEffect);

                    // Damage bonus effect
                    const damageBonusEffect = {
                        label: "Dread Ambusher - Bonus Damage",
                        icon: "icons/magic/nature/stealth-hide-beast-eyes-green.webp",
                        origin: featureOrigin,
                        changes: [
                            {
                                key: 'system.bonuses.mwak.damage',
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: '1d8',
                                priority: 20
                            },
                            {
                                key: 'system.bonuses.rwak.damage',
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: '1d8',
                                priority: 20
                            }
                        ],
                        flags: {
                            dae: {
                                selfTarget: false,
                                stackable: "none",
                                durationExpression: "",
                                macroRepeat: "none",
                                specialDuration: [
                                    "1Attack", "turnStartSource"
                                ],
                                transfer: false
                            }
                        },
                        disabled: false
                    };
                    newEffects.push(damageBonusEffect);

                    await MidiQOL.socket().executeAsGM("createEffects",
                        {actorUuid: actor.uuid, effects: [newEffects]});
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
                const isProne = await game.dfreds?.effectInterface?.hasEffectApplied('Prone', actor.uuid);
                const isDead = await game.dfreds?.effectInterface?.hasEffectApplied('Dead', actor.uuid);
                const isUnconscious = await game.dfreds?.effectInterface?.hasEffectApplied('Unconscious', actor.uuid);
                const isIncapacitated = await game.dfreds?.effectInterface?.hasEffectApplied('Incapacitated', actor.uuid);
                const isParalyzed = await game.dfreds?.effectInterface?.hasEffectApplied('Paralyzed', actor.uuid);
                const isPetrified = await game.dfreds?.effectInterface?.hasEffectApplied('Petrified', actor.uuid);
                const isStunned = await game.dfreds?.effectInterface?.hasEffectApplied('Stunned', actor.uuid);

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
            let tok = canvas.tokens.get(combatant.actor.token?.id);
            if (!tok) {
                tok = canvas.scene.tokens.find(t => t.actor.id === combatant.actor.id);
                if (!tok) {
                    ui.notifications.error("The Dead Walk - unable to find the source token");
                    return;
                }
            }

            // hide the original token
            await tok.document.update({ "hidden": true });

            // spawn the Zombie
            let position = tok.center;
            if (position) {
                //let options = {duplicates: 0, collision: false};
                let spawned = await warpgate.spawnAt(position, zombieActorName, updates, {}, {}); // last param is options
                if (!spawned || !spawned[0]) {
                    ui.notifications.error("The Dead Walk - unable to spawn the zombie");
                    return;
                }

                let spawnId = spawned[0];
                let summonedToken = canvas.tokens.get(spawnId);
                if (summonedToken) {
                    new Sequence()
                        .effect()
                        .atLocation(summonedToken)
                        .file("jb2a.misty_step.02.grey")
                        .scaleToObject(1.5)
                        .thenDo(async function () {
                            await summonedToken.toggleCombat();
                            const zombieInitiative = combatant.initiative ? combatant.initiative - .01
                                : 1 + (summonedToken.actor.system.abilities.dex.value / 100);
                            await summonedToken.combatant.update({initiative: zombieInitiative});
                        })
                        .play()

                    await warpgate.wait(500);
                    ChatMessage.create({
                        speaker: {alias: combatant.actor.name},
                        content: combatant.actor.name + " rises as a zombie"
                    });
                }
            }
        }
    }
}
