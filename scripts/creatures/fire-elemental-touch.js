/*
    Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) fire damage. If the target is a creature
    or a flammable object, it ignites. Until a creature takes an action to douse the fire, the target takes 5 (1d10)
    fire damage at the start of each of its turns.
 */
const version = "12.3.0";
const optionName = "Fire Elemental Touch";
const douseItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.QwEwf7d5Fxn29N68";

try {
    if ((args[0].macroPass === "postActiveEffects")  && (workflow.hitTargets.size > 0)) {
        let douseItem = await fromUuid(douseItemId);
        if (douseItem) {
            const douseItemData = game.items.fromCompendium(douseItem);
            if (douseItemData) {
                workflow.hitTargets.forEach(target => {
                    let hasItem = target.actor.items.find(i => i.name === "Douse Fire");
                    if (!hasItem) {
                        target.actor.createEmbeddedDocuments('Item', [douseItemData]);
                    }
                });
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
