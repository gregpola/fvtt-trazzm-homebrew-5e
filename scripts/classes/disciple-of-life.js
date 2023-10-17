/*
	Also starting at 1st level, your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell’s level.
*/
const version = "10.0.0";
const optionName = "Disciple of Life";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];

		// make sure it's an allowed attack
		if (!["heal"].includes(lastArg.itemData.system.actionType)) {
			return {};
		}
		
		// check the spell level
		if (lastArg.spellLevel < 1) {
			console.log(`${optionName}: spell level must be at least 1`);
			return {};
		}

		// add the healing bonus
		const healingBonus = 2 + lastArg.spellLevel;
		return {damageRoll: `${healingBonus}`, damageType: "healing", flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
