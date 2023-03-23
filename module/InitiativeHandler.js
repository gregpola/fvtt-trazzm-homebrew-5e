const VERSION = "10.0.0";

export class InitiativeHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering InitiativeHandler");
        InitiativeHandler.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.preRollInitiative", (actor, roll) => {

        });

        Hooks.on("dnd5e.rollInitiative", async(actor, combatants) => {
        });

        Hooks.on("combatStart", async (combat, delta) => {
            let tokens = combat.combatants.map(c => c.token);
            console.log(combat);

            // look for supported features in the combatants
            for (let token of tokens) {
                let actor = token.actor;

                // look for relentless
                let featureItem = actor?.items?.getName("Relentless");
                if (featureItem) {
                    // add a superiority die if they don't have any left
                    let resKey = InitiativeHandler.findResource(actor, "Superiority Dice");
                    if (resKey) {
                        let resources = actor.system.resources;
                        if (resources[resKey].value < 1) {
                            resources[resKey].value = 1;
                            actor.update({ "system.resources": resources });
                            await InitiativeHandler.wait(500);
                        }
                    }
                }

                // Look for Perfect Self
                featureItem = actor?.items?.getName("Perfect Self");
                if (featureItem) {
                    // At 20th level, when you roll for initiative and have no ki points remaining, you regain 4 ki points.
                    let resKey = InitiativeHandler.findResource(actor, "Ki Points");
                    if (resKey) {
                        let resources = actor.system.resources;
                        if (resources[resKey].value < 1) {
                            resources[resKey].value = 4;
                            actor.update({ "system.resources": resources });
                            await InitiativeHandler.wait(500);
                        }
                    }
                }

                // Look for Superior Inspiration
                featureItem = actor?.items?.getName("Superior Inspiration");
                if (featureItem) {
                    // At 20th level, when you roll initiative and have no uses of Bardic Inspiration left, you regain one use.
                    let resKey = InitiativeHandler.findResource(actor, "Bardic Inspiration");
                    if (resKey) {
                        let resources = actor.system.resources;
                        if (resources[resKey].value < 1) {
                            resources[resKey].value = 1;
                            actor.update({ "system.resources": resources });
                            await InitiativeHandler.wait(500);
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
                            await InitiativeHandler.wait(500);
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
                    actor.createEmbeddedDocuments("ActiveEffect", newEffects);
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
}
