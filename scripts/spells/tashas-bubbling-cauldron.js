/*
    You conjure a claw-footed cauldron filled with bubbling liquid. The cauldron appears in an unoccupied space on the
    ground within 5 feet of you and lasts for the duration. The cauldron can’t be moved and disappears when the spell
    ends, along with the bubbling liquid inside it.

    The liquid in the cauldron duplicates the properties of a Common or an Uncommon potion of your choice. As a Bonus
    Action, you or an ally can reach into the cauldron and withdraw one potion of that kind. The potion is contained in
    a vial that disappears when the potion is consumed. The cauldron can produce a number of these potions equal to your
    spellcasting ability modifier (minimum 1). When the last of these potions is withdrawn from the cauldron, the
    cauldron disappears, and the spell ends.

    Potions obtained from the cauldron that aren’t consumed disappear when you cast this spell again.
*/
const optionName = "Tasha's Bubbling Cauldron";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // get the summoned
        const companionTokenDoc = workflow.summonedCreatures[0];
        const companion = companionTokenDoc.actor;

        // delete all the other summon's tokens
        let duplicatePlaceables = canvas.tokens.placeables.filter(t => t.id !== companionTokenDoc.id && t.name === companion.name);
        if (duplicatePlaceables.length) {
            await canvas.scene.deleteEmbeddedDocuments("Token", duplicatePlaceables.map(d => d.id));
        }

        if (companion) {
            const doseCount = Math.max(actor.system.attributes.spell.mod, 1);

            // ask which potion
            const filters = {
                locked: {
                    types: new Set(['consumable']),
                    additional: {
                        rarity: { common: 1, uncommon: 1 },
                        type: { potion: 1 }
                    }
                }
            };

            const result = await dnd5e.applications.CompendiumBrowser.select({
                filters,
                selection: { min: 1, max: 1 }
            });

            // add the potions to the summon
            if (result) {
                const potionUuid = result.first();
                let potionItem = await fromUuid(potionUuid);
                if (potionItem) {
                    const potionDupe = foundry.utils.duplicate(potionItem);
                    potionDupe.system.quantity = doseCount;
                    await companion.createEmbeddedDocuments('Item', [potionDupe]);
                }
            }

            // convert summon to loot sheet
            game.itempiles.API.turnTokensIntoItemPiles([companionTokenDoc], {
                pileSettings: {
                    type: game.itempiles.pile_types.CONTAINER,
                    displayOne: false,
                    showItemName: true,
                    distance: 5,
                    displayItemTypes: true
                }
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
