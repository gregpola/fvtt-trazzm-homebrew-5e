/*
    A creature that touches the salamander or hits it with a melee attack while within 5 feet of it takes 7 (2d6) fire damage.
 */
const version = "11.0";
const optionName = "Heated Body";

try {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
            const attackingActor = workflow.item.parent;
            if (attackingActor && MidiQOL.getDistance(token, workflow.token) <= 5) {
                const damageRoll = await new Roll("2d6").roll({async: true});
                await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [workflow.token], damageRoll, {itemCardId: "new", itemData: actor.items.getName(optionName)});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
