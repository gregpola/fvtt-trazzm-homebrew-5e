/*
    You gain a new way of using your breath weapon, in addition to the standard action. You may use it once on your turn
    as a bonus action, but may not use it again in this way until it recharges on a 6 (d6), or at the start of the next combat.
*/
const optionName = "Breath of the Dragon";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // get the Breath Weapon item
        const breathWeaponItem = actor.items.find(i => i.name.endsWith(" Breath Weapon") && i.system.type.value === "race");
        if (breathWeaponItem) {
            // trigger the item
            await MidiQOL.completeItemUse(breathWeaponItem, {configureDialog: false, workflowOptions: { autoConsumeResource: "none" }});
            // consume: { resources: true, spellSlot: false, action: false }
            // workflowOptions: { autoConsumeResource: "none" }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
