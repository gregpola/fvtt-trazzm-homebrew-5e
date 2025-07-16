/*
    As a Magic action, you can make a melee spell attack with the fiery blade. On a hit, the target takes Fire damage
    equal to 3d6 plus your spellcasting ability modifier.

    The flaming blade sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2.
 */
const version = "12.4.0";
const optionName = "Flame Blade";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const swordItem = actor.items.find(a => a.name === "Flame Blade" && a.type === 'weapon');
        if (swordItem) {
            const spellLevel = workflow.castData.castLevel;
            let damageDice = 1 + spellLevel;
            await swordItem.update({
                'system.damage.base.number' : damageDice,
                'system.equipped' : true
            });
        }
        else {
            return ui.notifications.error(`${optionName} - unable to find the Flame Blade item`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
