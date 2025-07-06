/*
    As you hit the target, grasping vines appear on it, and it makes a Strength saving throw. A Large or larger creature
    has Advantage on this save. On a failed save, the target has the Restrained condition until the spell ends. On a
    successful save, the vines shrivel away, and the spell ends.

    While Restrained, the target takes 1d6 Piercing damage at the start of each of its turns. The target or a creature
    within reach of it can take an action to make a Strength (Athletics) check against your spell save DC. On a success,
    the spell ends.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1.
*/
const optionName = "Ensnaring Strike";
const version = "12.4.0";

try {
    if (args[0].macroPass === "preSave") {
        let targetToken = workflow.targets.first();
        if (targetToken && HomebrewHelpers.isLargeOrLarger(targetToken)) {
            await applyAdvantage(targetToken);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyAdvantage(targetToken) {
    let effectData = {
        name: optionName,
        icon: item.img,
        origin: item.uuid,
        changes: [
            {
                key: 'flags.midi-qol.advantage.ability.save.str',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: true,
                priority: 20
            }
        ],
        duration: {
            turns: 1
        },
        flags: {
            dae: {
                specialDuration: ['isSave']
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
}
