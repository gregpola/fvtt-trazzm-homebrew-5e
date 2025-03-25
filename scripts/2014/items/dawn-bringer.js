const version = "12.3.0";
const optionName = "Summon Dawn Bringer";
const swordItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-rise-of-the-drow.Item.NwtEpRUeOsnUgWyN";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const summonFlag = "summon-dawn-bringer";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let dawnBringerItem = await fromUuid(swordItemId);
        if (dawnBringerItem) {
            let tempItem = dawnBringerItem.toObject();
            let addedItem = await actor.createEmbeddedDocuments('Item',[tempItem]);
            if (addedItem && addedItem.length > 0) {
                await actor.setFlag(_flagGroup, summonFlag, addedItem[0].id);
            }
        }
        else {
            ui.notifications.error(`${optionName} - unable to find the item`);
        }
    }
    else if (args[0] === "off") {
        const dawnBringerId = actor.getFlag(_flagGroup, summonFlag);
        if (dawnBringerId) {
            await actor.unsetFlag(_flagGroup, summonFlag);
            await actor.deleteEmbeddedDocuments('Item', [dawnBringerId]);
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
