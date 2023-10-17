/*
    Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) fire damage. If the target is a creature
    or a flammable object, it ignites. Until a creature takes an action to douse the fire, the target takes 5 (1d10)
    fire damage at the start of each of its turns.
 */
const version = "11.0";
const optionName = "Touch";
const douseItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.J0sdVSSmNnwFPCS9";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // add the douse fire item to the target
        let douseItem = await fromUuid(douseItemId);
        if (douseItem) {
            const updates = {
                embedded: { Item: { ['Douse Fire']: game.items.fromCompendium(douseItem) } }
            }

            for (let target of workflow.hittargets) {
                // check for item already in the targets inventory
                let hasItem = target.actor.items.find(i => i.name === "Douse Fire");
                if (!hasItem) {
                    await warpgate.mutate(target.document, updates, {}, {name: "Douse Fire"});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
