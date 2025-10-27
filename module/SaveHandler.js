const _elementalResistanceTypes = new Set(["acid", "cold", "fire", "lightning", "thunder"]);
const _coronaOfLightTypes = new Set(["fire", "radiant"]);

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

        Hooks.on("dnd5e.rollDeathSave", async (rolls, details) => {
            console.log("rollDeathSave");
            const theRoll = Number(rolls[0].result);
            const survivor = details.subject.items.getName("Survivor");
            if (survivor && rolls[0].total >= 18) {
                rolls[0].total = 20;
            }
        });


    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
