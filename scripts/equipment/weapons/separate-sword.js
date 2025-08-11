const optionName = "Separate Sword";
const version = "12.4.1";
const bahamutId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-princes-of-the-apocalypse.Item.9xUXlw88DPI5NUrU";
const tiamatId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-princes-of-the-apocalypse.Item.8VtQoSRWJoqLcSoO";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const actorItem = actor.items.find(i => i.name === item.name);
        if (actorItem) {
            await actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
        }

        let firstSword = await fromUuid(bahamutId);
        let secondSword = await fromUuid(tiamatId);
        await actor.createEmbeddedDocuments('Item',[firstSword, secondSword]);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
