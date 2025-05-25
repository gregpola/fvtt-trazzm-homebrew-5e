const _elementalResistanceTypes = new Set(["acid", "cold", "fire", "lightning", "thunder"]);
const _coronaOfLightTypes = new Set(["fire", "radiant"]);

let conditionResilience = {
    'name': 'Condition Resilience',
    'icon': 'icons/magic/defensive/shield-barrier-glowing-triangle-teal.webp',
    'duration': {
        'seconds': 6
    },
    'changes': [
        {
            'key': 'flags.midi-qol.advantage.ability.save.all',
            'value': '1',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 9
        }
    ],
    'flags': {
        'dae': {
            'selfTarget': false,
            'selfTargetAlways': false,
            'stackable': 'none',
            'durationExpression': '',
            'macroRepeat': 'none',
            'specialDuration': [
                'isSave'
            ]
        }
    }
};

let conditionSensitivity = {
    'name': 'Condition Sensitivity',
    'icon': 'icons/skills/toxins/symbol-poison-drop-skull-green.webp',
    'duration': {
        'seconds': 6
    },
    'changes': [
        {
            'key': 'flags.midi-qol.disadvantage.ability.save.all',
            'value': '1',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 9
        }
    ],
    'flags': {
        'dae': {
            'selfTarget': false,
            'selfTargetAlways': false,
            'stackable': 'none',
            'durationExpression': '',
            'macroRepeat': 'none',
            'specialDuration': [
                'isSave'
            ]
        }
    }
};

const protectionFromEvilImmunity = {
    name: 'Protection from Evil Immunity',
    icon: 'icons/magic/defensive/shield-barrier-blue.webp',
    changes: [
        {
            key: 'flags.midi-qol.min.ability.save.all',
            value: 99,
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            priority: 120
        }
    ],
    flags: {
        dae: {
            specialDuration: ['isSave']
        }
    }
};

let starryFormDragonConcentration = {
    'name': 'Starry Form - Dragon concentration',
    'icon': 'icons/creatures/reptiles/dragon-horned-blue.webp',
    'duration': {
        'seconds': 6
    },
    'changes': [
        {
            'key': 'flags.midi-qol.min.ability.save.con',
            'value': '10',
            'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            'priority': 1
        }
    ],
    'flags': {
        'dae': {
            'selfTarget': false,
            'selfTargetAlways': false,
            'stackable': 'none',
            'durationExpression': '',
            'macroRepeat': 'none',
            'specialDuration': [
                'isSave'
            ]
        }
    }
};

export class SaveHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering SaveHandler");
        SaveHandler.hooks();
    }

    static hooks() {

        Hooks.on("midi-qol.preCheckSaves", async workflow => {
            // sanity checks
            if (!workflow.item.hasSave || !workflow.item.hasTarget) return;

            // get all the conditions
            let itemConditions = new Set();
            let appliesToElementalResistance = false;
            let appliesToCoronaOfLight = false;

            // first try effects
            if (workflow.item.effects?.size) {
                workflow.item.effects.forEach(effect => {
                    effect.changes.forEach(element => {
                        if (element.key === 'StatusEffect') {
                            itemConditions.add(element.value.toLowerCase());
                        }
                    });

                    effect.statuses.forEach(status => {
                        itemConditions.add(status.toLowerCase());
                    });
                });
            }

            // check damage types
            if (workflow.damageDetail) {
                const damageParts = workflow.damageDetail;
                for (let i = 0; i < damageParts.length; i++) {
                    let damageType = damageParts[i].type.toLowerCase();
                    if (!itemConditions.has(damageType)) {
                        itemConditions.add(damageType);
                    }

                    if (_elementalResistanceTypes.has(damageType)) {
                        appliesToElementalResistance = true;
                    }

                    if (_coronaOfLightTypes.has(damageType)) {
                        appliesToCoronaOfLight = true;
                    }
                }
            }

            if (workflow.otherDamageDetail) {
                const otherDamageParts = workflow.otherDamageDetail;
                for (let i = 0; i < otherDamageParts.length; i++) {
                    let damageType = otherDamageParts[i].type.toLowerCase();
                    if (!itemConditions.has(damageType)) {
                        itemConditions.add(damageType);
                    }

                    if (_elementalResistanceTypes.has(damageType)) {
                        appliesToElementalResistance = true;
                    }
                }
            }

            // look for options that allow save modifiers
            const targetIterator = workflow.targets.values();
            for (const tokenDoc of targetIterator) {
                let hasResilience = false;

                // Condition resistance handling
                if (itemConditions.size > 0) {
                    const condIterator = itemConditions.values();
                    for (const entry of condIterator) {
                        if (HomebrewHelpers.hasResilience(tokenDoc.document.actor, entry)) {
                            hasResilience = true;
                        }
                    }
                }

                // Check for other features that allow save mods
                let holyNimbus = HomebrewHelpers.findEffect(tokenDoc.document.actor, 'Holy Nimbus');
                if (holyNimbus) {
                    let undeadOrFiend = ["undead", "fiend"].some(type => (workflow.actor.system.details.type?.value || "").toLowerCase().includes(type));
                    if (undeadOrFiend) {
                        hasResilience = true;
                    }
                }

                // check for Keening Mist and a Necromancy spell
                let keeningMist = game.settings.get("fvtt-trazzm-homebrew-5e", "keening-mist");
                if (keeningMist && workflow.item.system.school === "nec") {
                    await MidiQOL.socket().executeAsGM('createEffects', {
                        'actorUuid': tokenDoc.document.actor.uuid,
                        'effects': [conditionSensitivity]
                    });
                    await SaveHandler.wait(100);
                }

                // Check for Elemental Resistance (Circle of the Elements) applicability
                let elementalResistance = tokenDoc.document.actor.items.find(f => f.name === "Elemental Resistance");
                if (elementalResistance && appliesToElementalResistance) {
                    hasResilience = true;
                }

                // check Protection from Evil and Good
                let protectionFromEvil = HomebrewHelpers.findEffect(tokenDoc.document.actor, 'Protection from Evil and Good');
                let purityOfSpirit = HomebrewHelpers.findEffect(tokenDoc.document.actor, 'Purity of Spirit');
                if (protectionFromEvil || purityOfSpirit) {
                    if (["aberration", "celestial", "elemental", "fey", "fiend", "undead"].some(type => (workflow.actor.system.details.type?.value || "").toLowerCase().includes(type))) {
                        if (itemConditions.has('charmed') || itemConditions.has('frightened')) {
                            await MidiQOL.socket().executeAsGM('createEffects', {
                                'actorUuid': tokenDoc.document.actor.uuid,
                                'effects': [protectionFromEvilImmunity]
                            });
                            await SaveHandler.wait(100);
                        }
                    }
                }

                // Check for Corona of Light
                let coronaOfLight = HomebrewHelpers.findEffect(tokenDoc.document.actor, 'Corona of Light - Disadvantage (In Aura)');
                if (coronaOfLight && appliesToCoronaOfLight) {
                    await MidiQOL.socket().executeAsGM('createEffects', {
                        'actorUuid': tokenDoc.document.actor.uuid,
                        'effects': [conditionSensitivity]
                    });
                    await SaveHandler.wait(100);
                }

                if (hasResilience) {
                    await MidiQOL.socket().executeAsGM('createEffects', {
                        'actorUuid': tokenDoc.document.actor.uuid,
                        'effects': [conditionResilience]
                    });
                    await SaveHandler.wait(100);
                }
            }
        });

        /**
         * Handle macro enforced save, the rollData must include the damageType for support
         */
        Hooks.on("dnd5e.preRollSavingThrowV2", async (config, dialog, message) => {
            logger.info("dnd5e.preRollSavingThrowV2");
        });

        Hooks.on("midi-qol.postCheckSaves", async workflow => {
            console.log("postCheckSaves");
        });

        Hooks.on("dnd5e.rollDeathSaveV2", async (rolls, details) => {
            console.log("rollDeathSaveV2");
            const theRoll = Number(rolls[0].result);
            const survivor = details.subject.items.getName("Survivor");
            if (survivor && rolls[0].total >= 18) {
                rolls[0].total = 20;
            }
        });


    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
