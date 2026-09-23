let deleteIds = game.items.filter(i => !i.folder).map(i => i.id);
Item.deleteDocuments(deleteIds);