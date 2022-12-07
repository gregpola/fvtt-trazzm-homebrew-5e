const version = "0.1.0";
const optionName = "Disciple of Life";

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["heal"].includes(at)) {
			console.log(`${optionName}: not an eligible actionType: ${at}`);
			return {};
		}
		
		// get the spell level
		const spellLevel = args[0].rollOptions?.spellLevel ?? 0;
		if (spellLevel < 1) {
			console.log(`${optionName}: spell level must be at least 1`);
			return {};
		}

		// add the healing bonus
		const healingBonus = 2 + spellLevel;
		return {damageRoll: `${healingBonus}`, damageType: "healing", flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
