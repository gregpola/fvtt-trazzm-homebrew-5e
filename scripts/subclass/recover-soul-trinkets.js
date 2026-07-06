/*
    Whenever you finish a Long Rest with fewer than two soul trinkets, you gain soul trinkets until you have two.
*/
const optionName = "Recover Soul Trinkets";
const version = "14.5.0";
const soulTrinketId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.KTw3numo88x5ezDc";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let currentTrinketCount = HomebrewHelpers.getSoulTrinketCount(actor);
        let recoverCount = 2 - currentTrinketCount;

        // add the trinkets
        if (recoverCount > 0) {
            let theItem = await fromUuid(soulTrinketId);
            if (!theItem) {
                return ui.notifications.error(`${optionName} - unable to find the soul trinket item`);
            }

            let tempItem = theItem.toObject();
            tempItem.system.quantity = recoverCount;
            await actor.createEmbeddedDocuments('Item', [tempItem]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
