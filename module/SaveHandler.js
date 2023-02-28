const VERSION = "10.0.0";
const _charmResistLabels = new Set(["Dark Devotion", "Fey Ancestry", "Leviathan Will", "Mental Discipline"]);
const _frightenedResistLabels = new Set(["Brave", "Dark Devotion", "Leviathan Will", "Mental Discipline"]);
const _paralyzedResistLabels = new Set(["Leviathan Will"]);
const _poisonResistLabels = new Set(["Dwarven Resilience", "Hill Rune", "Leviathan Will", "Poison Resilience", "Stout Resilience"]);
const _sleepResistLabels = new Set(["Leviathan Will"]);
const _stunResistLabels = new Set(["Leviathan Will"]);

let conditionResilience = {
    'label': 'Condition Resilience',
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

            // get all the conditions in the item
            let itemConditions = new Set();

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
                }
            }

            // check for any possible conditions
            if (itemConditions.size === 0) return;

            // Condition resistance handling
            const targetIterator = workflow.targets.values();
            for (const tokenDoc of targetIterator) {
                let hasResilience = false;
                const condIterator = itemConditions.values();
                for (const entry of condIterator) {
                    // poison
                    if (entry === 'poisoned' || entry === 'poison') {
                        let poisonFeature = tokenDoc.document.actor.items.find(f => _poisonResistLabels.has(f.name));
                        if (poisonFeature) {
                            hasResilience = true;
                        }
                    }
                    else if (entry === 'charmed' || entry === 'charm') {
                        let charmFeature = tokenDoc.document.actor.items.find(f => _charmResistLabels.has(f.name));
                        if (charmFeature) {
                            hasResilience = true;
                        }
                    }
                    else if (entry === 'frightened' || entry === 'fright') {
                        let frightFeature = tokenDoc.document.actor.items.find(f => _frightenedResistLabels.has(f.name));
                        if (frightFeature) {
                            hasResilience = true;
                        }
                    }
                    else if (entry === 'paralyzed' || entry === 'paralyze' || entry === 'paralysis') {
                        let paralyzeFeature = tokenDoc.document.actor.items.find(f => _paralyzedResistLabels.has(f.name));
                        if (paralyzeFeature) {
                            hasResilience = true;
                        }
                    }
                    else if (entry === 'stunned' || entry === 'stun') {
                        let stunFeature = tokenDoc.document.actor.items.find(f => _stunResistLabels.has(f.name));
                        if (stunFeature) {
                            hasResilience = true;
                        }
                    }
                    else if (entry === 'sleep' || entry === 'asleep') {
                        let sleepFeature = tokenDoc.document.actor.items.find(f => _sleepResistLabels.has(f.name));
                        if (sleepFeature) {
                            hasResilience = true;
                        }
                    }
                }

                if (hasResilience) {
                    await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': tokenDoc.document.actor.uuid, 'effects': [conditionResilience]});
                    await SaveHandler.wait(100);
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
            if (itemConditions.size === 0) return;

            for (const condition of itemConditions) {
                // poison
                if (condition === 'poisoned' || condition === 'poison') {
                    let poisonFeature = actor.items.find(f => _poisonResistLabels.has(f.name));
                    if (poisonFeature) {
                        rollData.advantage = true;
                    }
                }
                else if (condition === 'frightened' || condition === 'fright') {
                    let frightFeature = actor.items.find(f => _frightenedResistLabels.has(f.name));
                    if (frightFeature) {
                        rollData.advantage = true;
                    }
                }
                else if (condition === 'charmed' || condition === 'charm') {
                    let charmFeature = actor.items.find(f => _charmResistLabels.has(f.name));
                    if (charmFeature) {
                        rollData.advantage = true;
                    }
                }
                else if (condition === 'paralyzed' || condition === 'paralyze' || condition === 'paralysis') {
                    let paralyzeFeature = actor.items.find(f => _paralyzedResistLabels.has(f.name));
                    if (paralyzeFeature) {
                        rollData.advantage = true;
                    }
                }
                else if (condition === 'stunned' || condition === 'stun') {
                    let stunFeature = actor.items.find(f => _stunResistLabels.has(f.name));
                    if (stunFeature) {
                        rollData.advantage = true;
                    }
                }
                else if (condition === 'sleep' || condition === 'asleep') {
                    let sleepFeature = actor.items.find(f => _sleepResistLabels.has(f.name));
                    if (sleepFeature) {
                        rollData.advantage = true;
                    }
                }
            }
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
