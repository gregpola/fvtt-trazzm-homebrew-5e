const version = "12.3.1";
const optionName = "Wild Shape";

try {
    const folderName = `Wild Shape (${actor.name})`;
    const actorWildShapeFolder = game.folders.getName(folderName);

    if (args[0].macroPass === "preItemRoll") {
        if (!actorWildShapeFolder) {
            ui.notifications.error(`${optionName} - unable to locate the folder: ${folderName}`);
            return false;
        }

        if (!actorWildShapeFolder.contents || actorWildShapeFolder.contents.length === 0) {
            ui.notifications.error(`${optionName} - the folder is empty`);
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
            let shapeActor = actorWildShapeFolder.contents.find(i => i.id === wildshapeForm);
            let polymorphedTokens = await actor.transformInto(shapeActor, {
                keepBio: true,
                keepClass: true,
                keepMental: true,
                keepSpells: keepSpells,
                mergeSaves: true,
                mergeSkills: true,
                transformTokens: true },
                {
                    renderSheet: false
                });
            await HomebrewMacros.wait(500);

            if (polymorphedTokens) {
                let polyToken = polymorphedTokens[0];
                let itemsToAdd = [];

                const wildShapeRevert = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Revert Wild Shape");
                if (wildShapeRevert) {
                    itemsToAdd.push(wildShapeRevert);
                }

                const combatWildShape = actor.items.find(i => i.name === "Combat Wild Shape");
                if (combatWildShape) {
                    const wildShapeHealing = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Wild Shape Healing");
                    if (wildShapeHealing) {
                        itemsToAdd.push(wildShapeHealing);
                    }
                }

                if (itemsToAdd.length > 0) {
                    await polyToken.actor.createEmbeddedDocuments("Item", itemsToAdd);
                }

                Hooks.once("dnd5e.revertOriginalForm", (actor, data) => {
                    const originalActor = game.actors.get(actor.getFlag("dnd5e", "originalActor"));
                    revertWildShape(actor, originalActor);
                });
            }
        }
	}
	else if (args[0] === "off") {
        if (actor.isPolymorphed) {
            let originalActor = await actor.revertOriginalForm();
            if (originalActor) {
                await revertWildShape(actor, originalActor);
            }
        }
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function revertWildShape(wildShapeActor, originalActor) {
    if (wildShapeActor && originalActor) {
        // copy over spell slots
        const spells = foundry.utils.duplicate(wildShapeActor.system.spells);
        if (spells) {
            await originalActor.update({'system.spells' : spells});
        }

        // remove features
        let itemEffect = HomebrewHelpers.findEffect(originalActor, optionName);
        if (itemEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });
        }
    }
}
