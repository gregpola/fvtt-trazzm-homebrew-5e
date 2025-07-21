const optionName = "Separate Sword";
const version = "12.4.0";

try {
    if (args[0] === "on") {
        const actorItem = actor.items.find(i => i.name === item.name);
        if (actorItem) {
            await actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
