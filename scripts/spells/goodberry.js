/*
    Ten berries appear in your hand and are infused with magic for the duration. A creature can take a Bonus Action to
    eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature
    for one day.
*/
const version = "12.4.0";
const optionName = "Goodberry";
const berryItemId = "Compendium.dnd-players-handbook.spells.Item.phbutlMagicalBer";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let goodberryItem = await fromUuid(berryItemId);
        if (!goodberryItem) {
            return ui.notifications.error(`${optionName} - unable to find the goodberry item`);
        }

        let tempItem = goodberryItem.toObject();
        tempItem.system.quantity = 10;
        await actor.createEmbeddedDocuments('Item', [tempItem]);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
