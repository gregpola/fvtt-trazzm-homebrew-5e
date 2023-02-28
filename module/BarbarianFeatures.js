const VERSION = "10.0.0";

let totemSpiritBearEffect = {
    'label': 'Totem Spirit - Bear',
    'icon': 'icons/creatures/abilities/bear-roar-bite-brown-green.webp',
    'changes': [
        {
            'key': 'system.traits.dr.value',
            'value': 'acid',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'cold',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'fire',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'force',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'lightning',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'necrotic',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'poison',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'radiant',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        },
        {
            'key': 'system.traits.dr.value',
            'value': 'thunder',
            'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            'priority': 30
        }
    ],
    'flags': {
        'dae': {
            'specialDuration': [
                'isDamaged'
            ]
        }
    }
};


export class BarbarianFeatures {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering BarbarianFeatures");
        BarbarianFeatures.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.preAttackRoll", async workflow => {
            logger.info("midi-qol.preAttackRoll");
            const target = workflow.targets.first();

            // 'Totem Spirit - Wolf' - must be mwak or msak
            if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
                // check if an ally within 5 feet of the target has 'Totem Spirit - Wolf' and is raging
                const nearbyAllies = MidiQOL.findNearby(-1, target, 5);
                if (nearbyAllies.length > 0) {
                    const allyIter = nearbyAllies.values();
                    for (let ally of allyIter) {
                        if (workflow.token === ally) continue;

                        let rageEffect = ally.actor.effects.find(i => i.label === "Rage");
                        let totemSpiritWolf = ally.actor.items.getName("Totem Spirit - Wolf");

                        if (rageEffect && totemSpiritWolf) {
                            workflow.advantage = true;
                        }
                    }
                }
            }

            // 'Totemic Attunement - Bear'
            // find all enemies within 5-feet that are raging and have the feature
            let totemicBears = new Set();
            const nearbyEnemies = MidiQOL.findNearby(-1, workflow.token, 5);
            if (nearbyEnemies.length > 0) {
                const enemyIter = nearbyEnemies.values();
                for (let enemy of enemyIter) {
                    let rageEffect = enemy.actor.effects.find(i => i.label === "Rage");
                    let totemAttunementBear = enemy.actor.items.getName("Totemic Attunement - Bear");
                    if (rageEffect && totemAttunementBear) {
                        totemicBears.add(enemy.actor.uuid);
                    }
                }
            }

            if (totemicBears.size > 0) {
                if (!totemicBears.has(target.actor.uuid)) {
                    workflow.disadvantage = true;
                }
            }

        });

        Hooks.on("midi-qol.preDamageRollComplete", async workflow => {
            logger.info("midi-qol.preDamageRollComplete");

            const targetIterator = workflow.hitTargets.values();
            for (const token of targetIterator) {
                // Get rage effect
                let rageEffect = token.actor.effects.find(i => i.label === "Rage");

                // look for Totem Spirit - Bear
                let totemSpiritBear = token.actor.items.getName("Totem Spirit - Bear");
                if (rageEffect && totemSpiritBear) {
                    // add damage resistance to all but psychic for one hit
                    await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': token.actor.uuid, 'effects': [totemSpiritBearEffect]});
                    await BarbarianFeatures.wait(100);
                }
            }
        });

        Hooks.on("midi-qol.damageApplied", async (token, {item, workflow, ditem}) => {
            let targetActor = token?.document?.actor;
            if (!targetActor) {
                targetActor = token?.actor;
            }
            if (!targetActor) return;

            // Bail if the target actor does not have Relentless Rage
            let featureItem = targetActor.items.getName("Relentless Rage");
            if (featureItem) {
                // Bail if the actor is not raging
                let rageEffect = targetActor.effects.find(i => i.label === "Rage");
                if (rageEffect) {
                    if (ditem.newHP < 1) {
                        // Roll the actor's con save
                        const featureValue = featureItem.system.uses?.value ?? 1;
                        const targetValue = (10 + (5 * featureValue));
                        let saveRoll = await targetActor.rollAbilitySave("con", {flavor: "Relentless Rage - DC " + targetValue});
                        await game.dice3d?.showForRoll(saveRoll);
                        if (saveRoll.total >= targetValue) {
                            ditem.totalDamage = ditem.hpDamage = ditem.appliedDamage = ditem.oldHP - 1;
                            ditem.newHP = 1;
                        }

                        await featureItem.update({ "system.uses.value": featureValue + 1 });
                        await BarbarianFeatures.wait(500);
                    }
                }
            }
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
