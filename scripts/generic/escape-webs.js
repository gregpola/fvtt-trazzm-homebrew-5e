const version = "12.4.0";
const optionName = "Escape Webs";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "webEscapeDC";

try {
    let targetValue = 10;
    let flag = actor.getFlag(_flagGroup, _flagName);
    if (flag) {
        targetValue = flag;
    }

    const result = await actor.rollSkill("ath", {targetValue});
    if (result.isSuccess) {
        ChatMessage.create({
            content: `${actor.name} breaks free of the webs`,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });

        await actor.toggleStatusEffect('restrained', {active: false});

        const escapeItem = actor.items.find(i => i.name === 'Escape Webs');
        if (escapeItem) {
            await actor.deleteEmbeddedDocuments('Item', [escapeItem.id]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
