/*
    When you drink this potion, you can cast the animal friendship spell (save DC 13) for 1 hour at will. Agitating this
    muddy liquid brings little bits into view: a fish scale, a hummingbird tongue, a cat claw, or a squirrel hair.
*/
const version = "12.3.0";
const optionName = "Potion of Animal Friendship";

const spellItem = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-spells.Item.5Pdvir2Or1tpwXcu";
const spellName = "Animal Friendship (potion)";

try {
    if (args[0] === "on") {
        let addedSpell = await fromUuid(spellItem);
        let tempItem = addedSpell.toObject();
        tempItem.name = spellName;
        tempItem.system.preparation.mode = "atwill";
        tempItem.system.save.dc = 13;
        tempItem.system.save.scaling = "flat";
        tempItem.system.duration.value = "1";
        await actor.createEmbeddedDocuments('Item',[tempItem]);

    }
    else if (args[0] === "off") {
        const item = actor.items.find(i => i.name === spellName);
        if (item) {
            await actor.deleteEmbeddedDocuments('Item', [item.id]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
