const version = "12.4.0";
const optionName = "Maul of Squeamishness";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.hitTargets.size > 0) {
            if (workflow.isCritical) {
                const damageRoll = await new CONFIG.Dice.DamageRoll('1d8', {}, {type: "healing", properties: ["mgc"]}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], damageRoll, {
                    flavor: "Marge's Maul - critical healing",
                    itemCardId: "new",
                    itemData: macroItem.toObject()
                });
            }
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
