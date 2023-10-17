const version = "10.0.0";
const optionName = "Great Weapon Fighting";

try {
	if (args[0].macroPass === "postDamageRoll") {
		const {itemData, uuid} = args[0];
		let workflow = MidiQOL.Workflow.getWorkflow(uuid);

		// Must be a melee weapon attack
		if (!["mwak"].includes(itemData.system.actionType)) return {}; // weapon attack
		
		// Must be wielded two-handed
		if (itemData.system.properties.two || (itemData.system.properties.ver && (workflow.isVersatile || workflow.rollOptions.versatile))) {
			let isModified = false;
			
			for (let i = 0; i < workflow.damageRoll.terms.length; i++) {
				if ((workflow.damageRoll.terms[i] instanceof Die)
					&& workflow.damageRoll.terms[i].results?.find(r => r.result === 1 || r.result === 2) 
					&& !isModified) {
					await workflow.damageRoll.terms[i].reroll("r<3");
					const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(workflow.damageRoll.terms);
					await workflow.setDamageRoll(newDamageRoll)
					isModified = true;
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
