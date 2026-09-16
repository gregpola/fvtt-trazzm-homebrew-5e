/**
 * When you take the Help action to stabilize a creature with 0 Hit Points, you gain Heroic Inspiration. Once you use this benefit, you can’t use it again until you finish a Long Rest.
 */
const version = "14.5.0";
const optionName = "Arcane Undertaker";

try {
    const targetToken = workflow.targets.first();
    if (targetToken) {
        await actor.update({'system.attributes.inspiration' : true});

        await targetToken.actor.update({
            'system.attributes.death.success' : 0,
            'system.attributes.death.failure' : 0
        });
        ChatMessage.create({
            content: `${targetToken.name} is now stable`,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
