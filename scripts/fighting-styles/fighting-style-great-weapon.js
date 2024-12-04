/*
	When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two
	hands, you can reroll the die and must use the new roll, even if the new roll is a 1 or a 2. The weapon must have
	the two-handed or versatile property for you to gain this benefit.
 */
const version = "12.3.0";
const optionName = "Great Weapon Fighting";

try {
	if (args[0].macroPass === "postDamageRoll") {
		// Must be a melee weapon attack
		if (!["mwak"].includes(item.system.actionType)) return {}; // weapon attack
		
		// Must be wielded two-handed
		if (item.system.properties.has('two') || (item.system.properties.has('ver') && (workflow.isVersatile || workflow.rollOptions.versatile))) {
			for (let i = 0; i < workflow.damageRoll.terms.length; i++) {
				if ((workflow.damageRoll.terms[i] instanceof Die)
					&& workflow.damageRoll.terms[i].results?.find(r => r.result === 1 || r.result === 2)) {
					await workflow.damageRoll.terms[i].reroll("r<3");
					const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(workflow.damageRoll.terms);
					await workflow.setDamageRoll(newDamageRoll)
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
