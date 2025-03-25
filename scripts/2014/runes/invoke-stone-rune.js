/*
    When a creature you can see ends its turn within 30 feet of you, you can use your reaction to invoke the rune and
    force the creature to make a Wisdom saving throw. Unless the save succeeds, the creature is Charmed by you for 1
    minute. While charmed in this way, the creature has a speed of 0 and is incapacitated, descending into a dreamy
    stupor. The creature repeats the saving throw at the end of each of its turns, ending the effect on a success. Once
    you invoke this rune, you can’t do so again until you finish a short or long rest.
*/
const version = "12.3.0";
const optionName = "Invoke Stone Rune";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const dc = item.system.save.dc;

        for (let targetToken of workflow.failedSaves) {
            let extraChanges = [
                {
                    key: 'flags.midi-qol.OverTime',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: `label=Stone Rune, turn=end, allowIncapacitated=true, saveAbility=wis, saveDC=${dc}`,
                    priority: 1
                },
                {
                    key: 'system.attributes.movement.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: 0,
                    priority: 30

                }
            ];
            await HomebrewEffects.applyCharmedEffect(targetToken.actor, item.uuid, undefined, 60, ['incapacitated'], extraChanges);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
