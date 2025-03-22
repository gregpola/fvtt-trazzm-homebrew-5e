const key = "fvtt-trazzm-homebrew-5e.homebrew-items";
const pack = game.packs.get(key);

const wasLocked = pack.locked;
if (wasLocked) await pack.configure({locked: false});

// command data
const folderName = "Potions";
const fields = ["type", "system"];

// get the folder
const folder = pack.folders.getName(folderName);
if (folder) {
    const index = await pack.getIndex({fields: fields});

    const updates = [];
    for (const idx of index) {
        if (idx.system?.consumableType === 'potion') {
            updates.push({_id: idx._id, folder: folder.id});
        }
    }

    if (updates.length > 0) {
        await Item.updateDocuments(updates, {pack: key});
        if (wasLocked) await pack.configure({locked:true});
        await ui.notifications.warn(`${pack.metadata.label} ${folderName} Updated`)
    }
    else {
        await ui.notifications.warn(`${pack.metadata.label} ${folderName} no updates needed`)
    }
}
else {
    ui.notifications.error(`${folderName} not found in ${key}`);
}
