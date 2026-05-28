/*
    You touch one willing creature, and choose Acid, Cold, Fire, Lightning, or Poison. Until the spell ends, the target
    can take a Magic action to exhale a 15-foot Cone. Each creature in that area makes a Dexterity saving throw, taking
    3d6 damage of the chosen type on a failed save or half as much damage on a successful one.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2.
*/
const optionName = "Dragon's Breath";
const version = "14.5.0";
const damageTypes = [['🧪 Acid', 'acid', 'Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.UkZwpNPjliIuaUa6'],
    ['❄️ Cold', 'cold', 'Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.t7q9iZMXCGvyETA2'],
    ['🔥 Fire', 'fire', 'Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.RMYSn7CY2PutmmfG'],
    ['⚡ Lightning', 'lightning', 'Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.bsPb8pTKnxo5l9xB'],
    ['☠️ Poison', 'poison', 'Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.YHQen10JY8JR0FPo']];

try {
    if (args[0].macroPass === "postActiveEffects") {
        console.log(workflow);
        const spellLevel = workflow.castData.castLevel;
        const saveDC = actor.system.attributes.spell.dc;

        // ask which type of breath weapon
        // build the dialog content
        let content = `<p>Choose the ${optionName} damage type for the breath:</p>`;
        let first = true;
        for (let dt of damageTypes) {
            if (first) {
                content += `<label style="margin-left: 15px; margin-bottom: 5px;"><input style="right: 10px;" type="radio" name="choice" value="${dt[1]}" checked />${dt[0]}</label>`;
                first = false;
            }
            else {
                content += `<label style="margin-left: 15px; margin-bottom: 5px;"><input style="right: 10px;" type="radio" name="choice" value="${dt[1]}" />${dt[0]}</label>`;
            }
        }
        content += '<div style="margin-bottom: 10px;" />';

        // prompt the player
        let damageType = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choice.value;
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 400
            }
        });

        if (damageType) {
            // get the selected breath weapon feature
            let foundBreath = null;
            for (let i = 0; i < damageTypes.length; i++) {
                if (damageTypes[i][1] === damageType) {
                    foundBreath = damageTypes[i][2];
                    break;
                }
            }

            if (!foundBreath) {
                return ui.notifications.error(`${optionName}: ${version} - error getting the damage type item for ${damageType}`);
            }

            let breathItem = await fromUuid(foundBreath);
            if (!breathItem) {
                return ui.notifications.error(`${optionName}: ${version} - can't find the breath item for ${damageType}`);
            }

            // update damage and save DC
            let activity = breathItem.system.activities.getName("Save");
            if (activity) {
                const damageParts = foundry.utils.duplicate(activity.damage.parts);
                damageParts[0].number = spellLevel + 1;
                damageParts[0].formula = `${spellLevel + 1}d6`;

                const saveData = foundry.utils.duplicate(activity.save.dc);
                saveData.value = saveDC;
                saveData.formula = `${saveDC}`;

                await activity.update({
                    "damage.parts": damageParts,
                    "save.dc": saveData
                });
            }

            // put the item on the target
            const targetToken = workflow.targets.first();
            if (targetToken) {
                let tempItem = breathItem.toObject();
                tempItem.system.quantity = 10;
                let addedItem = await targetToken.actor.createEmbeddedDocuments('Item', [tempItem]);
                if (addedItem) {
                    await MidiQOL.addConcentrationDependent(actor, addedItem[0], macroItem);
                }
            }
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
