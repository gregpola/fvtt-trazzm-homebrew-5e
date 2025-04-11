const version = "12.4.0";
const optionName = "Wild Shape";
const revertItemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.MYPWTh4A4exdTZ9u";

try {
    const folderName = `Wild Shape (${actor.name})`;
    const actorWildShapeFolder = game.folders.getName(folderName);

    if (args[0].macroPass === "preItemRoll") {
        if (!actorWildShapeFolder) {
            ui.notifications.error(`${optionName} - unable to locate the actor folder: ${folderName}`);
            return false;
        }

        if (!actorWildShapeFolder.contents || actorWildShapeFolder.contents.length === 0) {
            ui.notifications.error(`${optionName} - the actor folder is empty`);
            return false;
        }

        return true;
    }
    else if ((args[0] === "on") && (!actor.isPolymorphed)) {
        const folderContents = actorWildShapeFolder.contents.reduce((acc, token) => acc += `<option value="${token.id}">${token.name} CR: ${token.system.details.cr}</option>`, ``);
        if (folderContents.length === 0) {
            return ui.notifications.error(`${optionName} - the actor has no options defined`);
        }

        const the_content = `<form><div class="form-group"><label for="beast">Wild Shape Form:</label><br /><select id="beast">${folderContents}</select></div></form>`;

        let druidLevel = actor.classes.druid?.system?.levels;
        const keepSpells = druidLevel >= 18;

        // prompt for form
        let wildshapeForm = await foundry.applications.api.DialogV2.prompt({
            content: the_content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    console.log(button.form.elements);
                    const targetId = button.form.elements.beast.value;
                    return targetId;
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
            // get actor features that impact wild shape
            const circleForms = actor.items.find(i => i.name === "Circle Forms");
            const improvedCircleForms = actor.items.find(i => i.name === "Circle Forms");

            let shapeActor = actorWildShapeFolder.contents.find(i => i.id === wildshapeForm);
            let polymorphedTokens = await actor.transformInto(shapeActor, foundry.utils.mergeObject(
                CONFIG.DND5E.transformationPresets.wildshape.options, { keepSpells: keepSpells }));
            await HomebrewMacros.wait(500);

            if (polymorphedTokens) {
                let polyToken = polymorphedTokens[0];
                let itemsToAdd = [];

                // add temp hit points
                const druidLevel = actor.getRollData().classes?.druid?.levels ?? 0;
                let tempMultiplier = circleForms ? 5 : 3;
                await actor.applyTempHP(tempMultiplier * druidLevel);

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
                    await HomebrewMacros.revertWildShape(actor, "Wild Shape");
                });
            }
        }
    }
    else if (args[0] === "off") {
        await HomebrewMacros.revertWildShape(actor, "Wild Shape");
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
