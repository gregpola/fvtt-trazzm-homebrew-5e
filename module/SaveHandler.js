const _elementalResistanceTypes = new Set(["acid", "cold", "fire", "lightning", "thunder"]);

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
            logger.info("midi-qol.preCheckSaves");

            // sanity checks
            if (!workflow.item.hasSave || !workflow.item.hasTarget) return;

            // get all the conditions
            let itemConditions = new Set();
            let appliesToElementalResistance = false;

            // first try effects
            if (workflow.item.effects?.size) {
                workflow.item.effects.forEach(effect => {
                    effect.changes.forEach(element => {
                        if (element.key === 'macro.CE') {
                            itemConditions.add(element.value.toLowerCase());
                        } else if (element.key === 'StatusEffect') {
                            itemConditions.add(element.value.toLowerCase());
                        }
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
                let holyNimbus = tokenDoc.document.actor.effects.find(f => f.name === 'Holy Nimbus');
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

                if (hasResilience) {
                    await MidiQOL.socket().executeAsGM('createEffects', {
                        'actorUuid': tokenDoc.document.actor.uuid,
                        'effects': [conditionResilience]
                    });
                    await SaveHandler.wait(100);
                }

                // check for concentration save modifiers
                if (workflow.item.name === 'Concentration') {
                    // Check for Starry Form - Dragon which grants minimum concentration save of 10
                    let starryFormDragonEffect = tokenDoc.document.actor.effects.find(f => f.name === 'starry-form-dragon');
                    if (starryFormDragonEffect) {
                        await MidiQOL.socket().executeAsGM('createEffects', {
                            'actorUuid': tokenDoc.document.actor.uuid,
                            'effects': [starryFormDragonConcentration]
                        });
                        await SaveHandler.wait(100);
                    }
                }
            }
        });

        /**
         * Handle macro enforced save, the rollData must include the damageType for support
         */
        Hooks.on("dnd5e.preRollAbilitySave", async (actor, rollData, ability) => {
            logger.info("dnd5e.preRollAbilitySave");

            // get all the conditions in the rollData
            let itemConditions = new Set();
            if (rollData.damageType)
                itemConditions.add(rollData.damageType);

            if (itemConditions.size > 0) {
                for (const condition of itemConditions) {
                    if (HomebrewHelpers.hasResilience(actor, condition)) {
                        rollData.advantage = true;
                    }
                }
            }
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
