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

            // look for options that allow save modifiers
            const targetIterator = workflow.targets.values();
            for (const tokenDoc of targetIterator) {
                // check for Keening Mist and a Necromancy spell
                let keeningMist = game.settings.get("fvtt-trazzm-homebrew-5e", "keening-mist");
                if (keeningMist && workflow.item.system.school === "nec") {
                    await MidiQOL.socket().executeAsGM('createEffects', {
                        'actorUuid': tokenDoc.document.actor.uuid,
                        'effects': [conditionSensitivity]
                    });
                    await SaveHandler.wait(100);
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
