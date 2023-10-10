/*
    Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC ??
    Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of
    its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends
    for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.

    NOTE: handle immunity manually
 */
const version = "11.0";
const optionName = "Frightful Presence";

try {
    if ((args[0].macroPass === "postActiveEffects")) {
        // TODO check for immunity flags

        // check the saves and apply frightened to those the failed
        const saveDC = workflow.item.system.save.dc;
        let overtimeValue = `turn=end, label=${optionName}, saveAbility=wis, saveDC=${saveDC}, rollType=save`;
        let frightenedEffect = {
            'label': optionName,
            'icon': 'icons/magic/control/fear-fright-monster-grin-red-orange.webp',
            'changes': [
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Frightened',
                    'priority': 21
                },
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    'value': overtimeValue,
                    'priority': 20
                }
            ],
            'origin': actor.uuid,
            'duration': {'seconds': 60},
            'flags': {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
            }
        };

        // loop through the failures
        for (let target of workflow.failedSaves) {
            await MidiQOL.socket().executeAsGM("createEffects",
                { actorUuid: target.actor.uuid, effects: [frightenedEffect] });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

