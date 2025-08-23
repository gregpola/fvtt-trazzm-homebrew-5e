/*
    A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius Sphere centered
    there makes a Constitution saving throw, taking 3d8 Thunder damage on a failed save or half as much damage on a
    successful one. A Construct has Disadvantage on the save.

    A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2.
*/
const optionName = "Shatter";
const version = "12.4.0";

try {
    if (args[0].macroPass === "preSave") {
        for (let targetToken of workflow.targets) {
            if (targetToken && (MidiQOL.typeOrRace(targetToken.actor) === 'construct')) {
                await applyDisadvantage(targetToken);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDisadvantage(targetToken) {
    let effectData = {
        name: optionName,
        icon: item.img,
        origin: item.uuid,
        changes: [
            {
                key: 'flags.midi-qol.disadvantage.ability.save.con',
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
