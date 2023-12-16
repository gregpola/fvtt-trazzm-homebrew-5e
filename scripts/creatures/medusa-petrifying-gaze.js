/*
    When a creature that can see the medusa's eyes starts its turn within 30 feet of the medusa, the medusa can force it
    to make a DC 14 Constitution saving throw if the medusa isn't incapacitated and can see the creature. If the saving
    throw fails by 5 or more, the creature is instantly petrified. Otherwise, a creature that fails the save begins to
    turn to stone and is restrained. The restrained creature must repeat the saving throw at the end of its next turn,
    becoming petrified on a failure or ending the effect on a success. The petrification lasts until the creature is
    freed by the greater restoration spell or other magic.
*/
const version = "11.0";
const optionName = "Petrifying Gaze";
const effectName = "Petrifying Gaze - Restrained";
const flagName = "petrifying-gaze-flag";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const saveDC = item.system.save.dc;

        for (let target of workflow.failedSaves) {
            let flag = target.actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
            if (flag) {
                await target.actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);
                if (!hasPetrifiedImmunity(target.actor)) {
                    await game.dfreds.effectInterface.addEffect({
                        'effectName': 'Petrified',
                        'uuid': target.actor.uuid,
                        'origin': actor.uuid,
                        'overlay': true
                    });
                }
                
                continue;
            }

            // check how much they failed by
            let saveData = workflow.saveResults.find(r => r.data.token === target);
            if (saveData) {
                let saveTotal = saveData.total;
                let saveDiff = saveDC - saveTotal;

                if (saveDiff < 5) {
                    if (!hasRestrainedImmunity(target.actor)) {
                        await target.actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, actor.uuid);

                        // add the Restrained effect to the target
                        let restrainedEffect = {
                            'name': effectName,
                            'icon': 'icons/magic/control/encase-creature-spider-hold.webp',
                            'changes': [
                                {
                                    'key': 'macro.CE',
                                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    'value': 'Restrained',
                                    'priority': 21
                                },
                                {
                                    'key': 'flags.midi-qol.OverTime',
                                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                    'value': `turn=end, label=Medusa Restrained, saveAbility=con, saveDC=${saveDC}, macro=ItemMacro.${item.uuid}`,
                                    'priority': 20
                                }
                            ],
                            'origin': actor.uuid,
                            'flags': {
                                'dae': {
                                    'specialDuration': ['turnEnd']
                                },
                            }
                        };

                        await MidiQOL.socket().executeAsGM("createEffects",
                            { actorUuid: target.actor.uuid, effects: [restrainedEffect] });

                    }
                }
                else {
                    if (!hasPetrifiedImmunity(target.actor)) {
                        await game.dfreds.effectInterface.addEffect({
                            'effectName': 'Petrified',
                            'uuid': target.actor.uuid,
                            'origin': actor.uuid,
                            'overlay': true
                        });
                    }
                }
            }
            else {
                console.error(`${optionName}: ${version}`, 'Unable to find the failed target save data');
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// TODO check for petrified immunity

function hasPetrifiedImmunity(actor) {
    if (actor) {
        return actor.system.traits.ci?.value?.has('petrified');
    }
    return false;
}

function hasRestrainedImmunity(actor) {
    if (actor) {
        return actor.system.traits.ci?.value?.has('restrained');
    }
    return false;
}
