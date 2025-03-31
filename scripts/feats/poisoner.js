const poisonItemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.dch5CCAfFiw75QYY";
let poisonItem = await fromUuid(poisonItemId);
if (poisonItem) {
    let tempItem = poisonItem.toObject();
    await actor.createEmbeddedDocuments('Item',[tempItem]);

    ChatMessage.create({
        content: `${actor.name} has prepared a a vial of poison`,
        speaker: ChatMessage.getSpeaker({ actor: actor })});
}
else {
    ui.notifications.error("Unable to find the poison item");
}
