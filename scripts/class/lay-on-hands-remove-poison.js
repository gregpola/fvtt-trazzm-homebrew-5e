/*
    You can also expend 5 Hit Points from the pool of healing power to remove the Poisoned condition from the creature;
    those points don’t also restore Hit Points to the creature.
*/
const optionName = "Lay on Hands - Remove Poison";
const version = "13.5.0";
const condition_list = ["Poisoned"];

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            const matchingEffects = HomebrewEffects.filterEffectsByConditions(targetToken.actor, condition_list);
            if (matchingEffects.length > 0) {
                // gather effect id's
                const effectIdList = matchingEffects.map(obj => obj.id);
                try {
                    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
                }
                catch (e2) {
                    console.error(e2);
                }
            }

            // clear any statuses
            condition_list.forEach(async function(value) {
                await targetToken.actor.toggleStatusEffect(value.toLowerCase(), {active: false});
            });

            ChatMessage.create({
                content: `${actor.name} applies their ${optionName} to ${targetToken.name}, removing all poisons. (DM may have to manually remove some effects)`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
