const version = "12.3.0";
const optionName = "Cloak of the Emissary - Restful Resonance";

try {
    if (args[0].macroPass === "DamageBonus" && workflow.hitTargets.size > 0) {
        if (workflow.item.system.actionType === 'heal' && item.name === 'Song of Rest') {
            return {damageRoll: '1d6', flavor: optionName};
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
