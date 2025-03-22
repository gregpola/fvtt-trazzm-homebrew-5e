/*
    When you drink this potion, it cures any disease afflicting you, and it removes the Blinded, Deafened, Paralyzed,
    and Poisoned conditions. The clear red liquid has tiny bubbles of light in it.
*/
const version = "12.3.0";
const optionName = "Elixir of Health";
const condition_list = ["Diseased", "Poisoned", "Blinded", "Deafened", "Paralyzed"];

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();

        if (targetToken) {
            const matchingEffects = HomebrewEffects.filterEffectsByConditions(targetToken.actor, condition_list);

            if (matchingEffects.length > 0) {
                // gather effect id's
                const effectIdList = matchingEffects.map(obj => obj.id);
                try {
                    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
                }
                catch (e2) {
                }
            }

            // clear any statuses
            condition_list.forEach(async function(value) {
                await targetToken.actor.toggleStatusEffect(value.toLowerCase(), {active: false});
            });

            ChatMessage.create({
                content: `${actor.name} administers an ${optionName} to ${targetToken.name}. (DM may have to manually remove some effects)`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
