// Turn Start
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let targetActor = event.data.token?.actor;

// check for immunity
if (!HomebrewHelpers.hasConditionImmunity('Poisoned')) {
    let spelldc = 12;

    const templateId = region.flags['region-attacher']?.attachedTemplate;
    if (templateId) {
        const template = await fromUuidSync(templateId);

        if (template) {
            let templateFlag = template.getFlag("fvtt-trazzm-homebrew-5e", "stinking-cloud-template-uuid");

            if (templateFlag) {
                spelldc = templateFlag.saveDC;
            }
        }
    }

    let saveRoll = await targetActor.rollAbilitySave("con", {flavor: "Resist stench - DC " + spelldc});
    await game.dice3d?.showForRoll(saveRoll);
    if (saveRoll.total < spelldc) {
        ChatMessage.create({
            content: `${targetActor.name} spends it's action retching and reeling`,
            speaker: ChatMessage.getSpeaker({actor: targetActor})
        });

    }
}

