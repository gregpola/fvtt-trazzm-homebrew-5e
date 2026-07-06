/*
	When you roll Initiative, you gain one soul trinket for your Tokens of the Departed if you have none remaining.
*/
const optionName = "Draw of Death";
const version = "14.5.0";
const soulTrinketId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.KTw3numo88x5ezDc";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let currentTrinketCount = HomebrewHelpers.getSoulTrinketCount(actor);
        if (currentTrinketCount === 0) {
            let theItem = await fromUuid(soulTrinketId);
            if (!theItem) {
                return ui.notifications.error(`${optionName} - unable to find the soul trinket item`);
            }

            let tempItem = theItem.toObject();
            tempItem.system.quantity = 1;
            await actor.createEmbeddedDocuments('Item', [tempItem]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
