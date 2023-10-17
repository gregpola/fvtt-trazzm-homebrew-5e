const version = "10.0.0";
const optionName = "Shocking Grasp";
const metalArmor = ["medium", "heavy"];

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "preAttackRoll") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		// check if the target is wearing metal armor
		const target = (lastArg.targets ? canvas.tokens.get(lastArg.targets[0].id) : null);
		if (target) {
			// find the target actor's armor that are metal
			let armor = target.actor.items.filter(i => ((i.type === `equipment`) && i.system.equipped
				&& metalArmor.includes(i.system.armor?.type) && (i.system.baseItem !== "hide")));
			
			if (armor && armor.length > 0) {
				lastArg.workflow.advantage = true;
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
