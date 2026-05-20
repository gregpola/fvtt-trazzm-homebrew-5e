/*
	Once before the spell ends, you can give yourself advantage on one weapon attack roll on your turn. That attack
	deals an extra 1d8 force damage on a hit. Whether you hit or miss, your walking speed increases by 30 feet until
	the end of that turn.
*/
const optionName = "Zephyr Strike";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "zephyr-strike";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        if (["mwak", "rwak"].includes(rolledActivity.actionType)) {
            let flag = actor.getFlag(_flagGroup, _flagName);
            if (!flag || !flag.used) {
                // ask if they want to use the option
                const useFeature = await foundry.applications.api.DialogV2.confirm({
                    content: `<p>Use ${optionName} advantage and bonus damage on this attack?</p>`,
                    rejectClose: false,
                    window: {
                        title: `${optionName}`,
                    },
                    position: {
                        width: 400
                    }
                });

                if (useFeature) {
                    await actor.setFlag(_flagGroup, _flagName, {used: true, applyDamage: true});
                    workflow.tracker.advantage.add(true, "Zephyr Strike");

                    // apply movement buff
                    let effectDataSpeed = [
                        {
                            "icon": `${macroItem.img}`,
                            "origin": `${macroItem.uuid}`,
                            "disabled": false,
                            "duration": {
                                "value": 0,
                                "units": 'turns',
                                "expiry": 'turnEnd',
                                "expired": false
                            },
                            "name": "Zephyr Strike - Speed",
                            "changes": [
                                {
                                    "key": "system.attributes.movement.all",
                                    "value": "+ 30",
                                    "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM
                                }
                            ],
                            "transfer": false
                        }
                    ];

                    let effect = await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: effectDataSpeed });
                    await MidiQOL.addConcentrationDependent(actor, effect[0], macroItem);

                    // Apply damage bonus
                    let effectDamageBonus = [
                        {
                            "icon": `${macroItem.img}`,
                            "origin": `${macroItem.uuid}`,
                            "disabled": false,
                            "duration": {
                                "value": 0,
                                "units": "turns",
                                "expiry": 'turnEnd',
                                "expired": false
                            },
                            "name": "Zephyr Strike - Bonus Damage",
                            "changes": [
                                {
                                    "key": "flags.automated-conditions-5e.damage.bonus",
                                    "value": "bonus=1d8[force]; once;",
                                    "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM
                                }
                            ],
                            "transfer": false
                        }
                    ];

                    effect = await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: effectDamageBonus });
                    await MidiQOL.addConcentrationDependent(actor, effect[0], macroItem);
                }
            }
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
