// This is actually a combat handler
const VERSION = "10.0.0";

export class CombatHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering CombatHandler");
        CombatHandler.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.preRollInitiative", (actor, roll) => {

        });

        Hooks.on("dnd5e.rollInitiative", async(actor, combatants) => {
        });

        Hooks.on("deleteCombat", async(combat) => {
            let tokens = combat.combatants.map(c => c.token);

            // remove temporary mutations related to combat
            for (let token of tokens) {
                await warpgate.revert(token, 'Escape Grapple');
                await warpgate.revert(token, 'Break Free');
            }
        });

        Hooks.on("updateCombat", async(combat, update, context, userId) => {
            console.log("updateCombat");

            // check for any turn start options
            let turnStartOptions = await CombatHandler.hasTurnStartOption(combat?.combatant);
            if (turnStartOptions) {
                const dialog = new TurnStartDialog({
                    combatant: combat?.combatant,
                }, {
                    width: 500
                }).render(true);
            }
        });

        // Hooks.on("updateCombat", NextUP.handleCombatUpdate)

        Hooks.on("updateActor", async(actor, change, options, user) => {
            // special death handling
            const hpUpdate = getProperty(change, "system.attributes.hp.value");
            if (hpUpdate !== undefined) {
                if (actor.system.attributes.hp.value <= 0) {
                    // look for the death of an actor that is grappling and/or restraining an actor
                    let tokens = canvas.scene.tokens;
                    for (let token of tokens) {
                        let existingGrappled = token.actor.effects.find(eff => eff.label === 'Grappled' && eff.origin === actor.uuid);
                        if (existingGrappled) {
                            await MidiQOL.socket().executeAsGM('removeEffects', {
                                actorUuid: token.actor.uuid,
                                effects: [existingGrappled.id]
                            });
                            await warpgate.revert(token, 'Escape Grapple');
                        }

                        let existingRestrained = token.actor.effects.find(eff => eff.label === 'Restrained' && eff.origin === actor.uuid);
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
                        let riseAsZombieRoll = await new Roll('1d100').evaluate({async: false});
                        await game.dice3d?.showForRoll(riseAsZombieRoll);
                        if (riseAsZombieRoll.total < 26) {
                            let zombieActorName = "Zombie (" + actor.name + ")";

                            let updates = {
                                token: {
                                    "name": zombieActorName,
                                    "disposition": CONST.TOKEN_DISPOSITIONS.HOSTILE,
                                    "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                                    "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS
                                },
                                "name": zombieActorName
                            };

                            let zombieActor = game.actors.getName(zombieActorName);
                            if (!zombieActor) {
                                // Get from the compendium
                                let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + zombieId);
                                if (!entity) {
                                    ui.notifications.error(`${optionName} - unable to find the actor`);
                                    return false;
                                }

                                // import the actor
                                let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), zombieId, updates);
                                if (!document) {
                                    ui.notifications.error(`${optionName} - unable to import from the compendium`);
                                    return false;
                                }
                                zombieActor = game.actors.getName(zombieActorName);
                            }

                            if (zombieActor) {
                                if ((!(game.modules.get("jb2a_patreon")?.active) && !(game.modules.get("sequencer")?.active))) {
                                    await actor.transformInto(zombieActor, { keepBio: true, transformTokens: true });
                                } else {
                                    let tok = canvas.tokens.get(actor.token?.id);
                                    if (!tok) {
                                        tok = canvas.scene.tokens.find(t => t.actor.id === actor.id);
                                    }

                                    new Sequence()
                                        .effect()
                                        .atLocation(tok)
                                        .file("jb2a.misty_step.02.grey")
                                        .scaleToObject(1.5)
                                        .thenDo(async function () {
                                            await actor.transformInto(zombieActor, { keepBio: true, transformTokens: true });
                                        })
                                        .play()
                                }
                                await warpgate.wait(1000);
                                ChatMessage.create({
                                    speaker: {alias: actor.name},
                                    content: actor.name + " rises as a zombie"
                                });
                            }
                        }
                    }
                }
            }
        });

        Hooks.on("combatStart", async (combat, delta) => {
            let tokens = combat.combatants.map(c => c.token);

            // look for supported features in the combatants
            for (let token of tokens) {
                let actor = token.actor;

                // look for relentless
                let featureItem = actor?.items?.getName("Relentless");
                if (featureItem) {
                    // add a superiority die if they don't have any left
                    let resKey = CombatHandler.findResource(actor, "Superiority Dice");
                    if (resKey) {
                        let resources = actor.system.resources;
                        if (resources[resKey].value < 1) {
                            resources[resKey].value = 1;
                            actor.update({ "system.resources": resources });
                            await CombatHandler.wait(500);
                        }
                    }
                }

                // Look for Perfect Self
                featureItem = actor?.items?.getName("Perfect Self");
                if (featureItem) {
                    // At 20th level, when you roll for initiative and have no ki points remaining, you regain 4 ki points.
                    let resKey = CombatHandler.findResource(actor, "Ki Points");
                    if (resKey) {
                        let resources = actor.system.resources;
                        if (resources[resKey].value < 1) {
                            resources[resKey].value = 4;
                            actor.update({ "system.resources": resources });
                            await CombatHandler.wait(500);
                        }
                    }
                }

                // Look for Superior Inspiration
                featureItem = actor?.items?.getName("Superior Inspiration");
                if (featureItem) {
                    // At 20th level, when you roll initiative and have no uses of Bardic Inspiration left, you regain one use.
                    let resKey = CombatHandler.findResource(actor, "Bardic Inspiration");
                    if (resKey) {
                        let resources = actor.system.resources;
                        if (resources[resKey].value < 1) {
                            resources[resKey].value = 1;
                            actor.update({ "system.resources": resources });
                            await CombatHandler.wait(500);
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
                        { actorUuid: actor.uuid, effects: [newEffects] });
                    //actor.createEmbeddedDocuments("ActiveEffect", newEffects);
                }
            }
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

    static findResource(actor, resourceName) {
        if (actor) {
            for (let res in actor.system.resources) {
                if (actor.system.resources[res].label === resourceName) {
                    return res;
                }
            }
        }

        return null;
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
                return ((hp > 0) && isProne);
            }
        }

        return false
    }
}

/**
 * A dialog to show options at the start of a combatants turn.
 *
 * The data associated with dialog is:
 *      content     - the dialog data content
 *      buttons     - the dialog buttons
 *      combatant   - the combatant whose turn it is
 *      prone       - flag indicating the combatant is prone
 *      hp          - the combatants current hp's
 *
 */
class TurnStartDialog extends Application {

    static DEFAULT_ID = 'trazzms-homebrew-turn-start-dialog';
    static _lastPosition = new Map();

    constructor(data, options) {
        options.height = "auto";
        options.resizable = true;
        super(options);
        this.data = data;
        this.prone = false;
        mergeObject(this.position, TurnStartDialog._lastPosition.get(this.options.id) ?? {});
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/fvtt-trazzm-homebrew-5e/templates/dialog.html",
            classes: ["dialog"],
            width: 500,
            jQuery: true,
            close: close
        }, { overwrite: true });
    }

    get title() {
        return this.data.title || "Turn Start";
    }

    async getData(options) {
        // collect actor data
        this.data.hp = this.data.combatant.actor.system.attributes.hp.value;
        this.data.prone = await game.dfreds?.effectInterface?.hasEffectApplied('Prone', this.data.combatant.actor.uuid);

        // TODO make the content conditional
        this.data.content = "<p>You are currently prone, would you like to stand up?<br>" +
            "<sub>(standing up costs an amount of movement equal to half your speed)</sub></p>" +
            "<div style='height: 25px;'/>";

        this.data.buttons = {
            standUp: { label: "Stand Up", callback: async (html) => {
                    await game.dfreds?.effectInterface?.removeEffect({effectName: 'Prone', uuid: this.data.combatant.actor.uuid});
                    this.close();
                }},
            close: { label: "Close", callback: (html) => {
                    TurnStartDialog.storePosition(html);
                    this.close();
                }}
        };
        this.data.default = "close";

        return {
            content: this.data.content,
            buttons: this.data.buttons
        };
    }

    static storePosition(html) {
        const id = html.id;
        const position = html.position;
        TurnStartDialog._lastPosition.set(id, {top: position.top, left: position.left});
    }

    static async standup() {
        await game.dfreds?.effectInterface?.removeEffect({effectName: 'Prone', uuid: this.data.combatant.actor.uuid});
    }

    activateListeners(html) {
        html.find(".dialog-button").click(this._onClickButton.bind(this));
        $(document).on('keydown.chooseDefault', this._onKeyDown.bind(this));
    }

    _onClickButton(event) {
        const oneUse = true;
        const id = event.currentTarget.dataset.button;
        const button = this.data.buttons[id];
        this.submit(button);
    }

    _onKeyDown(event) {
        // Close dialog
        if (event.key === "Escape" || event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            this.close();
        }
    }

    async submit(button) {
        try {
            if (button.callback) {
                await button.callback(this, button);
                // await this.getData({}); Render will do a get data, doing it twice breaks the button data?
                this.render(true);
            }
            // this.close();
        }
        catch (err) {
            ui.notifications?.error("fvtt-trazzm-homebrew-5e | Turn start dialog error see console for details ");
            console.error("fvtt-trazzm-homebrew-5e | ", err);
        }
    }

    async close() {
        if (this.data.close)
            this.data.close();
        $(document).off('keydown.chooseDefault');
        return super.close({force: true});
    }
}