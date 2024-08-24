/*
    At the start of your first turn of each combat, your walking speed increases by 10 feet, which lasts until the end
    of that turn. If you take the Attack action on that turn, you can make one additional weapon attack as part of that
    action. If that attack hits, the target takes an extra 1d8 damage of the weapon’s damage type.
*/
const version = "11.2";
const optionName = "Dread Ambusher";

// On Combat Starting -- add first round features
let movementBonusItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Dread Ambusher - Movement Bonus");
await actor.createEmbeddedDocuments("Item", [movementBonusItem]); // document?

let extraAttackItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Dread Ambusher - Extra Attack");
await actor.createEmbeddedDocuments("Item", [extraAttackItem]);


// On Combat Turn Ending -- remove first round features
const movementFeature = actor.items.find(i => i.name === "Dread Ambusher - Movement Bonus");
if (movementFeature) {
    movementFeature.delete();
}

const extraAttackFeature = actor.items.find(i => i.name === "Dread Ambusher - Extra Attack");
if (movementFeature) {
    extraAttackFeature.delete();
}
