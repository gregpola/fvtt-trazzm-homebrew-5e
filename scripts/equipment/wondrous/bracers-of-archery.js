/*
	While wearing these bracers, you have proficiency with the Longbow and Shortbow, and you gain a +2 bonus to damage
	rolls made with such weapons.
 */
const version = "12.4.0";
const optionName = "Bracers of Archery";
try {
	if (args[0].macroPass === "DamageBonus") {
		if (["shortbow","longbow"].includes(rolledItem.system.type?.baseItem)) {
			return new CONFIG.Dice.DamageRoll('+2[BracersOfArchery]', {}, {
				type: workflow.defaultDamageType,
				properties: [...rolledItem.system.properties]
			});
		}
	}

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
