/*
    As an action, one dose of the ointment can be swallowed or applied to the skin. The creature that receives it
    regains 2d8 + 2 hit points, ceases to be poisoned, and is cured of any disease.
*/
const version = "11.0";
const optionName = "Keoghtoms Ointment";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.targets.first();
        if (target) {
            // remove disease
            let diseaseEffect = target.actor.effects.find( i=> i.name === "Diseased");
            if (diseaseEffect) {
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: target.actor.uuid, effects: [diseaseEffect.id]});
            }

            // remove poison
            let poisonedEffect = target.actor.effects.find( i=> i.name === "Poisoned");
            if (poisonedEffect) {
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: target.actor.uuid, effects: [poisonedEffect.id]});
            }

            ChatMessage.create({
                content: `${target.name} is cured of all poison and disease. (DM may need to manually remove some effects)`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
