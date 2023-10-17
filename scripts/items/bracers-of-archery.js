const version = "10.0.0";
const optionName = "Bracers of Archery";
try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];

		// Must be a ranged weapon attack with either a longbow or shortbow
		if (!["rwak"].includes(lastArg.itemData.system.actionType))
			return {}; // weapon attack
		
		if (!["longbow", "shortbow"].includes(lastArg.itemData.system.baseItem))
			return {};
		
		// apply extra damage for the bracers
		return {damageRoll: `2`, flavor: `${optionName} Damage`};
	}

	return {};

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
