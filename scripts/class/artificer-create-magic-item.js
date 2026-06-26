/*
    Creating an Item. When you finish a Long Rest, you can create one or two different magic items if you have Tinker’s
    Tools in hand. Each item is based on one of the plans you know for this feature.

    If a created item requires Attunement, you can attune yourself to it the instant you create it. If you decide to
    attune to the item later, you must do so using the normal process for Attunement.

    When you reach certain Artificer levels specified in the Magic Items column of the Artificer Features table, the
    number of magic items you can create at the end of a Long Rest increases. Each item you create must be based on a
    different plan you know.

    You can’t have more magic items from this feature than the number shown in the Magic Items column of the Artificer
    Features table for your level. If you try to exceed your maximum number of magic items for this feature, the oldest
    item vanishes, and then the new item appears.
*/
const version = "14.5.0";
const optionName = "Replicate Magic Item";
const itemId = "Compendium.dnd-dungeon-masters-guide.equipment.Item.dmgAlchemyJugCon";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let createdItem = await fromUuid(itemId);
        if (!createdItem) {
            return ui.notifications.error(`${optionName} - unable to find the item`);
        }

        let tempItem = createdItem.toObject();
        await actor.createEmbeddedDocuments('Item', [tempItem]);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
