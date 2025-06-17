const version = "12.4.0";
const optionName = "Elemental Wild Shape";
const revertItemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.MYPWTh4A4exdTZ9u";

try {
    if ((args[0] === "on") && (!actor.isPolymorphed)) {

        const the_content = `<form><div class="form-group"><label for="beast">Elemental Form:</label><br />` +
            `<select id="beast">` +
            `  <option value="Compendium.fvtt-trazzm-homebrew-5e.trazzm-monsters-2024.Actor.1sEd6NHHQyvuWgzD">Air Elemental</option>` +
            `  <option value="Compendium.dnd-monster-manual.actors.Actor.mmEarthElemental">Earth Elemental</option>` +
            `  <option value="Compendium.fvtt-trazzm-homebrew-5e.trazzm-monsters-2024.Actor.TYpuBoTFRYsWnNBC">Fire Elemental</option>` +
            `  <option value="Compendium.fvtt-trazzm-homebrew-5e.trazzm-monsters-2024.Actor.IzqAuJAekTPPP2uI">Water Elemental</option>` +
            `</select></div></form>`;

        let druidLevel = actor.classes.druid?.system?.levels;
        const keepSpells = druidLevel >= 18;

        // prompt for form
        let wildshapeForm = await foundry.applications.api.DialogV2.prompt({
            content: the_content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.beast.value;
                }
            },
            window: {
                title: `${optionName}`
            },
            position: {
                width: 400
            }
        });

        if (wildshapeForm) {
            let shapeActor = await fromUuid(wildshapeForm);
            if (!shapeActor) {
                return ui.notifications.error(`${optionName} - unable to find the wild shape actor`);
            }

            let polymorphedTokens = await actor.transformInto(shapeActor, foundry.utils.mergeObject(
                CONFIG.DND5E.transformationPresets.wildshape.options, { keepSpells: keepSpells }));
            await HomebrewMacros.wait(500);

            if (polymorphedTokens) {
                let polyToken = polymorphedTokens[0];
                let itemsToAdd = [];

                // add temp hit points
                const druidLevel = actor.getRollData().classes?.druid?.levels ?? 0;
                await actor.applyTempHP(3 * druidLevel);

                // add wild shape features
                const wildShapeRevert = await fromUuid(revertItemId);
                if (wildShapeRevert) {
                    itemsToAdd.push(wildShapeRevert);
                }

                if (itemsToAdd.length > 0) {
                    await polyToken.actor.createEmbeddedDocuments("Item", itemsToAdd);
                }

                // TODO enable druid features as needed

                Hooks.once("dnd5e.revertOriginalForm", async(actor, data) => {
                    await HomebrewMacros.revertWildShape(actor, "Elemental Wild Shape");
                });
            }
        }
    }
    else if (args[0] === "off") {
        await HomebrewMacros.revertWildShape(actor, "Elemental Wild Shape");
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
