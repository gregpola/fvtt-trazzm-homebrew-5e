/*
    An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have
    Resistance to Necrotic damage, and your Hit Point maximums can’t be reduced. If an ally with 0 Hit Points starts its
    turn in the aura, that ally regains 1 Hit Point.
*/
const optionName = "Aura of Life";
const version = "13.5.0";

try {
    if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        // check for 0 hp
        if (token.actor?.system.attributes.hp.value === 0) {
            const damageRoll = await new CONFIG.Dice.DamageRoll('1', {}, {type: "healing", properties: ["mgc"]}).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], damageRoll, {
                flavor: optionName,
                itemCardId: "new",
                itemData: macroItem.toObject()
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
