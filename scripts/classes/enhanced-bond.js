const version = "10.0.0";
const optionName = "Enhanced Bond";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "DamageBonus") {
		let itemData = lastArg.itemData;
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		// make sure they have a wildfire spirit summoned
		let wildfireSpiritEffect = findEffect(actor, "Wildfire Spirit");
		if (!wildfireSpiritEffect) {
			console.log(`${optionName} - not applicable, no Wildfire Spirit summoned`);
			return {};
		}
		
		// check for healing or fire damage spells
		if (!["heal","msak", "rsak"].includes(itemData.system.actionType)) {
			console.log(`Action isn't applicable to ${optionName}`);
			return {};
		}

		// Get the damage type
		let damageType = itemData.system.damage.parts[0][1];
		
		// if a spell, check for fire damage
		if (["msak", "rsak"].includes(itemData.system.actionType)) {
			if (damageType !== "fire") {
				console.log(`${optionName} not a fire damage spell`);
				return {};
			}
		}
		
		const diceMult = lastArg.isCritical ? 2: 1;
		return {damageRoll: `${diceMult}d8[${damageType}]`, flavor: "Enhanced Bond"};
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

function findEffect(actor, effectName) {
    let effectUuid = null;
    effectUuid = actor?.effects?.find(ef => ef.label === effectName);
    return effectUuid;
}
