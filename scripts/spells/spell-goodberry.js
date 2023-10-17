/*
    Up to ten berries appear in your hand and are infused with magic for the duration. A creature can use its action to
    eat one berry. Eating a berry restores 1 hit point, and the berry provides enough nourishment to sustain a creature for one day.

    The berries lose their potency if they have not been consumed within 24 hours of the casting of this spell.
 */

const version = "10.0";
const optionName = "Goodberry";
const goodberryItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.BEwH4xi6M7mURuOk";
try {
    if (args[0].macroPass === "postActiveEffects") {
        const wf = scope.workflow;
        // add a random number of berries to the caster's inventory
        const countRoll = await new Roll('1d4').evaluate({ async: false });
        await game.dice3d?.showForRoll(countRoll);

        // import the Goodberry item if not alreaady
        let goodberryItem = game.items.getName(optionName);
        if (!goodberryItem) {
            goodberryItem = await fromUuid(goodberryItemId);
            if (!goodberryItem) {
                ui.notifications.error(`${optionName} - unable to find the goodberry`);
                return;
            }
        }

        let tempItem = goodberryItem.toObject();
        tempItem.system.quantity = 6 + countRoll.total;
        await actor.createEmbeddedDocuments('Item',[tempItem]);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
