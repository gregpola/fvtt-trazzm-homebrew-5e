const version = "12.3.0";
const optionName = "Heated Body";

try {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
            const attackingActor = workflow.item.parent;
            if (attackingActor && MidiQOL.computeDistance(token, workflow.token) <= 5) {
                const damageRoll = await new CONFIG.Dice.DamageRoll('3d6', {}, { type: 'fire', appearance: { colorset: 'fire' } }).evaluate();
                await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [workflow.token], damageRoll, {itemCardId: "new", itemData: macroItem.toObject()});
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
