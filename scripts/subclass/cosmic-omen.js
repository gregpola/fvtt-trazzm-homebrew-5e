/**
 *  Whenever you finish a Long Rest, you can consult your Star Map for omens and roll a die. Until you finish your next
 *  Long Rest, you gain access to a special Reaction based on whether you rolled an even or an odd number on the die:
 *
 *  Weal (Even). Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a
 *  Reaction to roll 1d6 and add the number rolled to the total.
 *
 *  Woe (Odd). Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a
 *  Reaction to roll 1d6 and subtract the number rolled from the total.
 *
 * You can use this Reaction a number of times equal to your Wisdom modifier (minimum of once), and you regain all
 * expended uses when you finish a Long Rest.
 */
const optionName = "Cosmic Omen";
const version = "14.5.0";
const wealId = "cosmic-omen-weal";
const wealUuid = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.g0bMnKDPcyE9dRku";
const woeId = "cosmic-omen-woe";
const woeUuid = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.k458UK24N2VAOL0v";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const isOdd = workflow.utilityRoll.total % 2;

        // remove old result
        let oldWeals = actor.items.filter(i => i.identifier === wealId);
        let itemUuids = oldWeals.map(t => t.id);
        await actor.deleteEmbeddedDocuments('Item', itemUuids);

        let oldWoes = actor.items.filter(i => i.identifier === woeId);
        itemUuids = oldWoes.map(t => t.id);
        await actor.deleteEmbeddedDocuments('Item', itemUuids);

        // add the new feature
        if (isOdd) {
            await HomebrewHelpers.addItemFromCompendiumToActor(actor, woeUuid);
        }
        else {
            await HomebrewHelpers.addItemFromCompendiumToActor(actor, wealUuid);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
