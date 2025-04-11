/*
    If you have the [Invisible] condition when you cast a spell on a creature, it has Disadvantage on any
    saving throw it makes against the spell on the same turn.
 */
const version = "12.4.0";
const optionName = "Magical Ambush";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preSave") {
        if (actor.statuses.has("invisible")) {
            for (let targetToken of workflow.targets) {
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
                key: 'flags.midi-qol.disadvantage.ability.save.all',
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
