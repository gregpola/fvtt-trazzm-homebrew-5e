/*
	The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the
	elemental or hits it with a melee attack while within 5 feet of it takes 5 (1d10) fire damage. In addition, the
	elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn,
	that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the
	creature takes 5 (1d10) fire damage at the start of each of its turns.
*/
const version = "11.0";
const optionName = "Fire Form";
const douseItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.J0sdVSSmNnwFPCS9";

try {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
            const attackingActor = workflow.item.parent;
            if (attackingActor && MidiQOL.getDistance(token, workflow.token) <= 5) {
                const damageRoll = await new Roll("1d10").roll({async: true});
                await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [workflow.token], damageRoll, {itemCardId: "new", itemData: actor.items.getName(optionName)});
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        // add the douse fire item to the target
        let douseItem = await fromUuid(douseItemId);
        if (douseItem) {
            const updates = {
                embedded: { Item: { ['Douse Fire']: game.items.fromCompendium(douseItem) } }
            }

            for (let target of workflow.targets) {
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
