import Constants from './t5e-constants.js';
import {combat} from './combat.js';

const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _zombieId = "UBlzKwy8bHtN42NQ";

export class CombatHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering CombatHandler");
        CombatHandler.hooks();
    }

    static hooks() {

        Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
            // Check if this is a self-targeting action that deals damage
            const shouldPrompt = await CombatHandler.checkSelfTargeting(workflow);
            if (shouldPrompt) {
                let dialogContent = `<p><strong>${workflow.actor.name}</strong> is attacking themselves with ${workflow.item.name}</p>`;
                dialogContent += "<p>Are you sure you want to proceed?</p>";

                const confirmed = await foundry.applications.api.DialogV2.confirm({
                    window: {
                        title: 'Weapon Mastery: Push',
                    },
                    content: dialogContent,
                    rejectClose: false,
                    modal: true
                });

                if (!confirmed) {
                    console.info('Action cancelled - you stopped hitting yourself!');

                    // Abort the workflow completely
                    workflow.aborted = true;
                    return false;
                }
            }

            return true;
        });

        Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {
            if (workflow.isFumble && ["mwak", "rwak"].includes(workflow.activity.actionType)) {
                const fumbleHandler = game.settings.get(Constants.MODULE_ID, Constants.USE_WEAPON_FUMBLES);
                if (fumbleHandler === Constants.FUMBLE_DUNGEON_DUDES || fumbleHandler.toLowerCase() === 'dudes') {
                    await CombatHandler.handleWeaponFumble(workflow);
                }
            }
        });

        Hooks.on('preUpdateCombat', combat.legendaryActionsPrompt);

        Hooks.on("updateCombat", async (combat, update, context, userId) => {
            if (!combat?.combatant?.isOwner) {
                console.log("updateCombat - not owner")
                return;
            }

            // make sure we have a direction
            if (!context.direction) {
                console.log("updateCombat - skipping for no direction")
                return;
            }

            // no use cases for backwards change
            const isBackwards = (context.direction < 1);

            // check for any turn start options
            let turnStartOptions = await CombatHandler.hasTurnStartOption(combat?.combatant);
            if (turnStartOptions && !isBackwards) {
                // get the player to prompt
                let player = MidiQOL.playerForActor(combat.combatant.actor);
                if (player && player.active) {
                    await game.trazzm.socket.executeAsUser("doTurnStartOptions", player.id, combat.combatant.actor.uuid, turnStartOptions);
                }
                else {game.users?.activeGM
                    await game.trazzm.socket.executeAsUser("doTurnStartOptions", game.users.activeGM.id, combat.combatant.actor.uuid, turnStartOptions);
                }
            }

            let actor = combat?.combatant?.actor;
            if (actor && !isBackwards) {
                // check for heroic warrior
                const heroicWarrior = actor.items.getName("Heroic Warrior");
                if (heroicWarrior) {
                    await actor.update({'system.attributes.inspiration' : true});
                }

                // check for Survivor
                // At the start of each of your turns, you regain Hit Points equal to 5 plus your Constitution modifier
                // if you are Bloodied and have at least 1 Hit Point.
                const survivor = actor.items.getName("Survivor");
                const bloodied = HomebrewHelpers.findEffect(actor, "Bloodied");
                if (survivor && bloodied && (actor.system.attributes.hp.value > 0)) {
                    const healRoll = 5 + actor.system.abilities.con.mod;
                    await actor.applyDamage(- healRoll);
                    ChatMessage.create({
                        speaker: {alias: actor.name},
                        content: `${actor.name} recovers ${healRoll} hit points from their Survivor trait`,
                    });
                }
            }

            // select the token
            if (combat && combat.started && combat?.combatant?.token?.isOwner){ // && setting('select-combatant')) {
                combat?.combatant?.token?._object?.control();
            }

            // pan to combatant
            if (combat && combat.started && combat?.combatant?.token && game.settings.get(Constants.MODULE_ID, Constants.PAN_TO_COMBATANT)) {
                if (canvas.dimensions.rect.contains(combat?.combatant?.token.x, combat?.combatant?.token.y)) {
                    canvas.animatePan({ x: combat?.combatant?.token.x, y: combat?.combatant?.token.y });
                }
            }

        });

        Hooks.on("preUpdateActor", async (actor, change, options, user) => {
            if (!actor.isOwner) {
                console.log("preUpdateActor - not owner")
                return;
            }

            const isHealth = foundry.utils.hasProperty(change, "system.attributes.hp.value");
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
            }
        });

        // TODO Unfortunately the hooks are not called when rolling initiative using the carousal
        /*
            actor	Actor5e	The Actor that is rolling initiative.
            roll	D20Roll	The pre-evaluated roll.
         */
        Hooks.on("dnd5e.preRollInitiative", async (actor, roll) => {
            const ambush = actor.items.getName("Ambush");

        });

        Hooks.on("dnd5e.rollInitiative", async (actor, combatants) => {
            const ambush = actor.items.getName("Ambush");

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
                const isSleeping =  actor.statuses.has("sleeping");

                // prone conditionals
                let laughterEffect =  actor.getRollData().effects.find(eff => eff.name.toLowerCase().includes('hideous laughter'));
                if (isProne && laughterEffect) {
                    isProne = false;
                }

                if ((hp > 0) && isProne && !isDead && !isUnconscious && !isIncapacitated && !isParalyzed && !isPetrified && !isStunned && !isSleeping) {
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

    /**
     * Check if the workflow involves self-targeting with damage
     * @param {MidiQOL.Workflow} workflow - The midi-qol workflow object
     * @returns {Promise<boolean>} - True if should show prompt
     */
    static async checkSelfTargeting(workflow) {
        // Make sure we have necessary data
        if (!workflow?.actor || !workflow?.targets || !workflow?.item) {
            return false;
        }

        // Check if any target is the actor themselves
        const targets = Array.from(workflow.targets);
        const isSelfTargeted = targets.some(target => {
            return target.actor?.id === workflow.actor.id;
        });

        if (!isSelfTargeted) {
            return false;
        }

        // Check if the item deals damage or healing
        const itemData = workflow.item;

        // Check multiple possible locations for damage/healing info
        const actionType = itemData.system?.actionType;

        // D&D 5e v4 uses activities
        const hasActivities = itemData.system?.activities?.size > 0;
        const firstActivity = hasActivities ? Array.from(itemData.system.activities.values())[0] : null;

        // Check for damage in various places
        const damageParts = itemData.system?.damage?.parts || firstActivity?.damage?.parts;
        const hasDamageParts = damageParts && damageParts.length > 0;

        // Check for healing
        const healingFormula = itemData.system?.healing?.formula || firstActivity?.healing?.formula;
        const hasHealing = !!healingFormula || actionType === 'heal';

        if (hasHealing) {
            return false;
        }

        // Prompt if there's damage or (healing and includeHealing is true)
        return hasDamageParts;
    }

    static async handleWeaponFumble(workflow) {
        const fumbleTableRoll = await new CONFIG.Dice.D20Roll("1d20").evaluate();
        switch (fumbleTableRoll.total) {
            case 1:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Dangerously exposed. The target of your attack can use its reaction to either make a single melee attack against you with advantage, or move half its speed without provoking opportunity attacks.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                break;

            case 2:
            case 3:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Lost grip. Your currently equipped weapon flies from your hand in a random direction, landing up to 15 feet away from you.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });

                // randomly determine thrown location
                const squares = Math.floor(Math.random() * 3) + 1;
                const distance = canvas.dimensions.size * squares;
                const angle = (Math.random() * 360) * (Math.PI / 180);

                const ray = foundry.canvas.geometry.Ray.fromAngle(workflow.token.center.x, workflow.token.center.y, angle, 1);
                let newCenter = ray.project(distance);
                //let newCenter = ray.project(1 + ((canvas.dimensions.size * knockBackFactor) / ray.distance));

                const pileData = await game.itempiles.API.createItemPile({
                    enabled: true,
                    deleteWhenEmpty: true,
                    position: {
                        x: newCenter.x,
                        y: newCenter.y
                    },
                    itemPileFlags: {
                        enabled: true,
                        deleteWhenEmpty: true
                    },
                    tokenOverrides: {
                        name: workflow.item.name
                    },
                    items: [
                        {
                            item: workflow.item,
                            quantity: 1
                        }
                    ]
                });
                await game.itempiles.API.removeItems(workflow.actor, [{ item: workflow.item, quantity: 1 }]);
                break;

            case 4:
            case 5:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Clumsy footwork. Your speed is reduced to zero until the start of your next turn. If you’ve already moved this turn, you fall prone. `,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                const movedThisTurn = workflow.token.document.movementHistory.filter(m=>m.movementId === token.document.movementHistory.at(-1).movementId).reduce((acc, c) => acc += c.cost ?? 0, 0);
                if (movedThisTurn) {
                    await workflow.actor.toggleStatusEffect("prone", {active: true});
                }
                else {
                    const rdEffect = {
                        name: "Clumsy Footwork",
                        transfer: false,
                        img: "icons/skills/movement/ball-spinning-blue.webpp",
                        origin: workflow.actor.uuid,
                        type: "base",
                        changes: [
                            {
                                key: "system.attributes.movement.all",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: "0",
                                priority: 20
                            }
                        ],
                        disabled: false,
                        flags: {
                            dae: {
                                showIcon: false,
                                stackable: 'noneNameOnly',
                                specialDuration: [
                                    'turnStartSource',
                                    'endCombat'
                                ]
                            }
                        }
                    };
                    await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [rdEffect] });
                }
                break;

            case 6:
            case 7:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Resounding deflection. You have disadvantage on your next attack roll.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                const rdEffect = {
                    name: "Resounding Deflection",
                    transfer: false,
                    img: "icons/skills/targeting/crosshair-arrowhead-blue.webp",
                    origin: workflow.actor.uuid,
                    type: "base",
                    changes: [
                        {
                            key: "flags.automated-conditions-5e.attack.disadvantage",
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: "once",
                            priority: 20
                        }
                    ],
                    disabled: false,
                    flags: {
                        dae: {
                            showIcon: false,
                            stackable: 'noneNameOnly',
                            specialDuration: [
                                'endCombat',
                                'turnEnd'
                            ]
                        }
                    }
                };
                await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [rdEffect] });
                break;

            case 8:
            case 9:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Disrupted focus. You can’t take reactions until the start of your next turn.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                await MidiQOL.setReactionUsed(workflow.actor);
                break;

            case 10:
            case 11:
                ChatMessage.create({
                    content: `${workflow.token.name} is Caught off-guard. The next attack roll made against you gains advantage.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                const cogEffect = {
                    name: "Caught Off-guard",
                    transfer: false,
                    img: "icons/skills/targeting/crosshair-arrowhead-blue.webp",
                    origin: workflow.actor.uuid,
                    type: "base",
                    changes: [
                        {
                            key: "flags.automated-conditions-5e.grants.attack.advantage",
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: "once",
                            priority: 20
                        }
                    ],
                    disabled: false,
                    flags: {
                        dae: {
                            showIcon: false,
                            stackable: 'noneNameOnly',
                            specialDuration: [
                                'endCombat',
                                'turnEnd'
                            ]
                        }
                    }
                };
                await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [cogEffect] });
                break;

            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Poor aim. The attack misses with no additional effect.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                break;

            case 18:
            case 19:
                ChatMessage.create({
                    content: `${workflow.token.name} suffers Transferred momentum. The attack misses, but you gain advantage on your next attack roll.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                const tmEffect = {
                    name: "Transferred Momentum",
                    transfer: false,
                    img: "icons/skills/targeting/crosshair-arrowhead-blue.webp",
                    origin: workflow.actor.uuid,
                    type: "base",
                    changes: [
                        {
                            key: "flags.automated-conditions-5e.attack.advantage",
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: "once; actionType.mwak || actionType.rwak",
                            priority: 20
                        }
                    ],
                    disabled: false,
                    flags: {
                        dae: {
                            showIcon: false,
                            stackable: 'noneNameOnly',
                            specialDuration: [
                                'endCombat',
                                'turnEnd'
                            ]
                        }
                    }
                };
                await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [tmEffect] });
                break;

            case 20:
                ChatMessage.create({
                    content: `${workflow.token.name} gains Remarkable reversal. Instead of a miss, the attack hits instead.`,
                    speaker: ChatMessage.getSpeaker({actor: workflow.actor})
                });
                const newAttackRoll = await new CONFIG.Dice.D20Roll
                (
                    String(99),
                    workflow.item.getRollData(),
                    {}
                ).evaluate();
                await workflow.setAttackRoll(newAttackRoll);
                break;
        }
    }
}
