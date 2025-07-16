/*
    When you cast this spell using a 3rd- or 4th-level spell slot, the damage increases to 3d8. When you cast it using
    a 5th- or 6th-level spell slot, the damage increases to 4d8. When you cast it using a spell slot of 7th level or
    higher, the damage increases to 5d8.
 */
const version = "12.4.0";
const optionName = "Shadow Blade";
const itemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.BYuo5htmfWVmMevl";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const swordItem = actor.items.find(a => a.name === "Shadow Blade" && a.type === 'weapon');
        if (swordItem) {
            const spellLevel = workflow.castData.castLevel;
            let damageDice = 2;
            switch (spellLevel) {
                case 3:case 4:
                    damageDice = 3;
                    break;

                case 5:case 6:
                    damageDice = 4;
                    break;

                case 7:case 8:case 9:
                    damageDice = 4;
                    break;
            }

            await swordItem.update({
                'system.damage.base.number' : damageDice,
                'system.equipped' : true
            });
        }
        else {
            return ui.notifications.error(`${optionName} - unable to find the Shadow Blade item`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
