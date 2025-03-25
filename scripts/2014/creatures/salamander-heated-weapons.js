const version = "11.0";
const optionName = "Heated Weapons";

try {
    if (args[0].macroPass === "DamageBonus" && workflow.hitTargets.size > 0) {
        if (workflow.item.system.actionType == "mwak" && workflow.item.system.weaponType !== "Natural") {
            return {damageRoll: '1d6[fire]', flavor: `${optionName} Damage`};
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
