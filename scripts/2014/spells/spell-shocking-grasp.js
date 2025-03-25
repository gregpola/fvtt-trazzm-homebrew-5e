const version = "11.0";
const optionName = "Shocking Grasp";
const metalArmor = ["medium", "heavy"];

try {
	if (args[0].macroPass === "preAttackRoll") {
		// check if the target is wearing metal armor
		const target = workflow.targets.first();
		if (target) {
			// find the target actor's armor that are metal
			let armor = target.actor.items.filter(i => ((i.type === `equipment`) && i.system.equipped
				&& metalArmor.includes(i.system.armor?.type) && (i.system.baseItem !== "hide")));
			
			if (armor && armor.length > 0) {
				workflow.advantage = true;
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
