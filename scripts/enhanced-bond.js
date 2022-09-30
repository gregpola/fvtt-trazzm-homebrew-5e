const version = "0.1.0";
const optionName = "Enhanced Bond";

try {

	if (args[0].macroPass === "DamageBonus") {
		let itemData = args[0].item.data;
		
		// check for healing or fire damage spells
		if (!["heal","msak", "rsak"].includes(itemData.actionType)) {
			console.log(`Action isn't applicable to ${optionName}`);
			return {};
		}

		// Get the damage type
		let damageType = itemData.damage.parts[0][1];
		
		// if a spell, check for fire damage
		if (["msak", "rsak"].includes(itemData.actionType)) {
			// actor.items.getName("Scorching Ray").data.data.damage.parts[0][1]
			if (damageType !== "fire") {
				console.log(`${optionName} not a fire damage spell`);
				return {};
			}
		}
		
		//let targetUuid = args[0].hitTargets[0].uuid;
		const diceMult = args[0].isCritical ? 2: 1;
		return {damageRoll: `${diceMult}d8[${damageType}]`, flavor: "Enhanced Bond"};
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
