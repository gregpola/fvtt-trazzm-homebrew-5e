/*
    As an action, one dose of the ointment can be swallowed or applied to the skin. The creature that receives it
    regains 2d8 + 2 hit points, ceases to be poisoned, and is cured of any disease.
*/
const version = "12.3.0";
const optionName = "Keoghtoms Ointment";
const condition_list = ["Diseased", "Poisoned"];

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            const matchingEffects = HomebrewEffects.filterEffectsByConditions(targetToken.actor, condition_list);

            if (matchingEffects.length > 0) {
                // gather effect id's
                const effectIdList = matchingEffects.map(obj => obj.id);
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
            }

            // clear any statuses
            await targetToken.actor.toggleStatusEffect("diseased", {active: false});
            await targetToken.actor.toggleStatusEffect("poisoned", {active: false});

            ChatMessage.create({
                content: `${targetToken.name} is cured of all poison and disease. (DM may need to manually remove some effects)`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
