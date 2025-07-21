const optionName = "Combine Swords";
const version = "12.4.0";
const swordName = "Bahamut's Justice";
const swordName2 = "Tiamat's Revenge";


try {
    if (args[0] === "on") {
        let actorItem = actor.items.find(i => i.name === swordName);
        if (actorItem) {
            await actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
        }

        actorItem = actor.items.find(i => i.name === swordName2);
        if (actorItem) {
            await actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
