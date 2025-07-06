/*
    You touch one willing creature, and choose Acid, Cold, Fire, Lightning, or Poison. Until the spell ends, the target
    can take a Magic action to exhale a 15-foot Cone. Each creature in that area makes a Dexterity saving throw, taking
    3d6 damage of the chosen type on a failed save or half as much damage on a successful one.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2.
*/
const optionName = "Dragon's Breath";
const version = "12.4.0";

try {
    if (args[0] === "on") {
        const castLevel = args[1];
        const saveDC = args[2];
        const itemUuid = effect.changes[0].value.trim();
        const compendiumItem = await fromUuid(itemUuid);
        if (compendiumItem) {
            const actorItem = actor.items.find(i => i.name === compendiumItem.name);
            if (actorItem) {
                // update damage and save DC
                let activity = actorItem.system.activities.getName("Breath");

                const damageParts = foundry.utils.duplicate(activity.damage.parts);
                damageParts[0].number = castLevel + 1;
                damageParts[0].formula = `${castLevel + 1}d6`;

                const saveData = foundry.utils.duplicate(activity.save.dc);
                saveData.value = saveDC;
                saveData.formula = `${saveDC}`;

                await activity.update({
                    "damage.parts": damageParts,
                    "save.dc": saveData
                });
            }
            else {
                ui.notifications.error(`${optionName}: ${version} - unable to find the breath item on the target!`);
            }

        }
        else {
            ui.notifications.error(`${optionName}: ${version} - unable to find the breath item in the compendium!`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
