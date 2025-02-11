/*
    If the yeti takes fire damage, it has disadvantage on attack rolls and ability checks until the end of its next turn.
*/
const version = "12.3.0";
const optionName = "Fear of Fire";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // look for fire damage
        const fireRolls = workflow.damageDetail.filter(i => ['fire'].includes(i.type.toLowerCase()));
        if (fireRolls && fireRolls.length > 0) {
            await applyDisadvantageEffect(actor);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDisadvantageEffect(targetActor) {
    const effectData = {
        name: 'Fire Disadvantage',
        origin: targetActor.uuid,
        changes: [
            { key: "flags.midi-qol.disadvantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 },
            { key: "flags.midi-qol.disadvantage.ability.check.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 21 }
        ],
        duration: {seconds: 6},
        icon: "icons/skills/melee/strike-sword-gray.webp",
        flags: {
            dae: {
                stackable: 'noneNameOnly',
                specialDuration: ['turnEnd']
            }
        }
    }

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}
