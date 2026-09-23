//const folderId = "id of the folder here";
//const types = ["feat", "gear"];
const types = ["spell"];
const items = game.items.filter(i => types.includes(i.type));

for(const item of items) {
    await item.exportToJSON()
}