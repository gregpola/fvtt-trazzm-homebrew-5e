const {value} = character.data.data.resources.primary;
const item = character.items.getName("name of the item or spell to use");
const roll = await item.roll();
if(!roll) return;
await character.update({"data.resources.primary.value": value + 1});