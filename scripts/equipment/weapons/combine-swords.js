const optionName = "Combine Swords";
const version = "12.4.1";
const swordName = "Bahamut's Justice";
const swordName2 = "Tiamat's Revenge";
const greatswordId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-princes-of-the-apocalypse.Item.ejX2blnntgLjFiD5";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let actorItem = actor.items.find(i => i.name === swordName);
        if (actorItem) {
            await actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
        }

        actorItem = actor.items.find(i => i.name === swordName2);
        if (actorItem) {
            await actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
        }

        let newSword = await fromUuid(greatswordId);
        await actor.createEmbeddedDocuments('Item',[newSword]);

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
