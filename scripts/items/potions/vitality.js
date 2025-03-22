/*
    When you drink this potion, it removes any Exhaustion you are suffering and cures any disease or poison affecting
    you. For the next 24 hours, you regain the maximum number of hit points for any Hit Die you spend. The potion's
    crimson liquid regularly pulses with dull light, calling to mind a heartbeat.
*/
const version = "12.3.0";
const optionName = "Potion of Vitality";
const condition_list = ["Diseased", "Poisoned", "Exhaustion"];

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            const matchingEffects = HomebrewEffects.filterEffectsByConditions(targetToken.actor, condition_list);

            if (matchingEffects.length > 0) {
                // gather effect id's
                const effectIdList = matchingEffects.map(obj => obj.id);
                try {
                    await MidiQOL.socket().executeAsGM("removeEffects", {
                        actorUuid: targetToken.actor.uuid,
                        effects: effectIdList
                    });
                } catch (e2) {
                }
            }

            // clear any statuses
            condition_list.forEach(async function (value) {
                await targetToken.actor.toggleStatusEffect(value.toLowerCase(), {active: false});
            });
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
