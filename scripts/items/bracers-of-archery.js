/*
	While wearing these bracers, you have proficiency with the longbow and shortbow, and you gain a +2 bonus to damage
	rolls on ranged attacks made with such weapons.
 */
const version = "12.3.0";
const optionName = "Bracers of Archery";
try {
	if (args[0].macroPass === "DamageBonus") {
		// Must be a ranged weapon attack with either a longbow or shortbow
		if (["rwak"].includes(workflow.item.system.actionType)) {
			if (["longbow", "shortbow"].includes(workflow.item.system.type.baseItem)) {
				return {damageRoll: '2', flavor: optionName};
			}
		}
	}

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
