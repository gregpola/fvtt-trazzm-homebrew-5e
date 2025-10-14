import {combat} from './combat.js';

const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _zombieId = "UBlzKwy8bHtN42NQ";

export class CombatHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering CombatHandler");
        CombatHandler.hooks();
    }

    static hooks() {

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
            if (combat && combat.started && combat?.combatant?.token && game.settings.get(_flagGroup, "pan-to-combatant")) {
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
