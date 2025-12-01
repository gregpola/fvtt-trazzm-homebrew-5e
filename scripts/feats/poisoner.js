const optionName = "Poisoner - Brew Poison";
const version = "13.5.0";
const poisonItemIdDex = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.dch5CCAfFiw75QYY";
const poisonItemIdInt = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.NVuTzt9OxDQPUXvR";

try {
    let poisonItem = await fromUuid(poisonItemIdDex);
    if (poisonItem) {
        let tempItem = poisonItem.toObject();
        const brewCount = actor.system.attributes.prof;

        for (let i = 0; i < brewCount; i++) {
            await actor.createEmbeddedDocuments('Item',[tempItem]);
        }

        ChatMessage.create({
            content: `${actor.name} has prepared ${brewCount} vials of poison`,
            speaker: ChatMessage.getSpeaker({ actor: actor })});
    }
    else {
        ui.notifications.error("Unable to find the poison item");
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
