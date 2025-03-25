/*
	When you hit a creature with an attack using a weapon, you can invoke the rune to summon fiery shackles: the target
	takes an extra 2d6 fire damage, and it must succeed on a Strength saving throw or be Restrained for 1 minute. While
	restrained by the shackles, the target takes 2d6 fire damage at the start of each of its turns. The target can repeat
	the saving throw at the end of each of its turns, banishing the shackles on a success. Once you invoke this rune,
	you can’t do so again until you finish a short or long rest.
*/
const version = "12.3.0";
const optionName = "Invoke Fire Rune";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const dc = item.system.save.dc;

        let restrainedEffect = {
            name: 'Restrained by Fiery Shackles',
            icon: 'icons/magic/symbols/runes-carved-stone-red.webp',
            changes: [
                {
                    key: 'flags.midi-qol.OverTime',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: `turn=end, saveAbility=str, saveDC=${dc}, label=Fiery Shackles`,
                    priority: 1
                },
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    'value': `turn=start, damageRoll=2d6, damageType=fire, label=Fiery Shackles`,
                    'priority': 2
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.dex',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: true,
                    priority: 20
                },
                {
                    key: 'flags.midi-qol.disadvantage.attack.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: true,
                    priority: 21
                },
                {
                    key: 'flags.midi-qol.grants.advantage.attack.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: true,
                    priority: 22
                },
                {
                    key: 'system.attributes.movement.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: 0,
                    priority: 23
                }
            ],
            statuses: [
                'restrained'
            ],
            flags: {
                dae: {
                    specialDuration: ['shortRest', 'longRest', 'combatEnd']
                }
            },
            origin: item.uuid,
            duration: {
                seconds: 60
            },
            disabled: false
        };

        for (let targetToken of workflow.failedSaves) {
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [restrainedEffect] });
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
