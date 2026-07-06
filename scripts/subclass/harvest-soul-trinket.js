/*
    When a creature you can see within 30 feet of you dies, you can take a Reaction to gain another soul trinket,
    claiming a sliver of that creature’s departing spirit. The new trinket appears somewhere on your person.

    You can have a maximum of two soul trinkets at a time. If you try to gain a soul trinket while at your maximum, one
    of your existing trinkets is immediately destroyed and replaced by the new trinket. The maximum number of soul
    trinkets you can have increases when you reach Rogue levels 13 (three trinkets) and 17 (four trinkets).
*/
const optionName = "Harvest Soul Trinket";
const version = "14.5.0";
const soulTrinketId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.KTw3numo88x5ezDc";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // make sure the target is dead
        const targetToken = workflow.targets.first();
        if (targetToken && targetToken.actor.statuses.has("dead")) {
            let currentTrinketCount = HomebrewHelpers.getSoulTrinketCount(actor);
            const allowedMax = actor.system.scale['phantom-rogue']['maximum-soul-trinkets'];
            if (allowedMax > currentTrinketCount) {
                let theItem = await fromUuid(soulTrinketId);
                if (!theItem) {
                    return ui.notifications.error(`${optionName} - unable to find the soul trinket item`);
                }

                let tempItem = theItem.toObject();
                tempItem.system.quantity = 1;
                await actor.createEmbeddedDocuments('Item', [tempItem]);
            }
            else {
                ui.notifications.error(`${optionName}: ${version} - already have your maximum number of soul trinkets`);
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - the target must be dead`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
