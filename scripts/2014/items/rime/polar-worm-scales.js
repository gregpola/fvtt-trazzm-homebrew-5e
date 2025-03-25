/*
    Heated Body: When donning this armor, any adversary within 5 feet who successfully attacks or touches the wearer
    will suffer 1d6 fire damage.
*/
const version = "12.3.0";
const optionName = "Polar Worm Scales";

try {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
            const attackingActor = workflow.item.parent;
            if (attackingActor && MidiQOL.computeDistance(token, workflow.token) <= 5) {

                const damageRoll = await new CONFIG.Dice.DamageRoll('1d6', {}, { type: 'fire', appearance: { colorset: 'fire' } }).evaluate();
                await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [workflow.token], damageRoll, {itemCardId: "new", itemData: actor.items.getName(optionName).toObject()});
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
