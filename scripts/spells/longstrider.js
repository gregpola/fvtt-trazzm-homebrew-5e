/*
    You touch a creature. The target’s speed increases by 10 feet until the spell ends.

    At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.
*/
const version = "11.0";
const optionName = "Longstrider";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        let maxTargets = spellLevel;

        for (let t of workflow.targets) {
            // ignore targets beyond the spell level
            if (maxTargets > 0) {
                maxTargets--;
                await applyLongstriderEffect(workflow.itemUuid, t);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyLongstriderEffect(origin, target) {
    // Build movement changes data
    let changeData = [];
    // check each movement type
    const originalMovement = target.actor.system.attributes.movement;

    if (originalMovement.burrow > 0) {
        changeData.push({ key: 'system.attributes.movement.burrow', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '10', priority: 30 });
    }

    if (originalMovement.climb > 0) {
        changeData.push({ key: 'system.attributes.movement.climb', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '10', priority: 30 });
    }

    if (originalMovement.fly > 0) {
        changeData.push({ key: 'system.attributes.movement.fly', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '10', priority: 30 });
    }

    if (originalMovement.swim > 0) {
        changeData.push({ key: 'system.attributes.movement.swim', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '10', priority: 30 });
    }

    if (originalMovement.walk > 0) {
        changeData.push({ key: 'system.attributes.movement.walk', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '10', priority: 30 });
    }

    if (changeData.length > 0) {
        let effectData = [{
            name: optionName,
            icon: 'icons/skills/movement/figure-running-gray.webp',
            origin: origin,
            transfer: false,
            disabled: false,
            duration: {startTime: game.time.worldTime, seconds: 3600},
            changes: changeData
        }];

        // apply the effect
        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: effectData});
    }
}
