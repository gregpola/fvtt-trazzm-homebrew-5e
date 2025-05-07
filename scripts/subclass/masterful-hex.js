/*
    Your patron’s accursed might flows even more strongly through you, granting the following benefits.

    Accursed Critical. Any attack roll you make against the target cursed by your Hex scores a Critical Hit on a roll of
    a 19 or 20 on the d20.

    Infectious Hex. When you use one of your Hexblade’s Maneuvers, you can target one additional creature within 30 feet
    of the cursed target. The additional target takes 1d6 Necrotic damage.

    Resilient Hex. Taking damage can’t break your Concentration on Hex.
*/
const optionName = "Masterful Hex";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (HomebrewHelpers.isHexed(actor, targetToken.actor)) {
            let effectData = {
                name: optionName,
                icon: item.img,
                changes: [
                    {
                        key: 'flags.midi-qol.grants.criticalThreshold',
                        mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                        value: 19,
                        priority: 20
                    }
                ],
                flags: {
                    dae: {
                        specialDuration: ['isAttacked']
                    }
                },
                origin: item.uuid,
                duration: {
                    seconds: 6
                },
                disabled: false
            };

            await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: targetToken.actor.uuid, effects: [effectData]});
        }

    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // check for concentrating on Hex
        const hexItem = actor.items?.find(a => a.name === "Hex");
        if (hexItem) {
            let existingConcentration = MidiQOL.getConcentrationEffect(actor, hexItem);
            if (existingConcentration) {
                let effectData = {
                    name: optionName,
                    icon: item.img,
                    changes: [
                        {
                            key: 'flags.automated-conditions-5e.concentration.success',
                            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            value: true,
                            priority: 20
                        }
                    ],
                    flags: {
                        dae: {
                            specialDuration: ['isSave', 'turnStart']
                        }
                    },
                    origin: item.uuid,
                    duration: {
                        seconds: null
                    },
                    disabled: false
                };

                await MidiQOL.socket().executeAsGM("createEffects",
                    {actorUuid: actor.uuid, effects: [effectData]});

            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
