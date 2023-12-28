/*
    The troll slices itself with a claw, releasing a spray of poison in a 15-foot cube. The troll takes 7 (2d6) slashing
    damage, which can’t be reduced in any way. Each creature in the area must make a DC 16 Constitution saving throw. On
    a failed save, a creature takes 18 (4d8) poison damage and is poisoned for 1 minute. On a successful save, the creature
    takes half as much damage and isn’t poisoned. A poisoned creature can repeat the saving throw at the end of each of
    its turns, ending the effect on itself on a success.
 */
const version = "11.0";
const optionName = "Venom Spray";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // apply damage to the troll
        let trollRoll = await new Roll('2d6').roll({async: true});

        await MidiQOL.applyTokenDamage(
            [{damage: trollRoll.total , type:'slashing'}],
            trollRoll.total, new Set([token]), item, new Set(), {});

        // apply poisoned overtime effect to failures
        const poisonedEffectData = {
            'name': 'Venom Spray - Poisoned',
            'icon': workflow.item.img,
            'origin': actor.uuid,
            'changes': [
                {
                    key: 'flags.midi-qol.OverTime',
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: 'turn=end, saveAbility=con, saveDC=16, label=Poisoned',
                    priority: 20
                },
                { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 21 }
            ],
            'duration': {'seconds': 60}
        };

        for (let target of workflow.failedSaves) {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': target.actor.uuid, 'effects': [poisonedEffectData]});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
