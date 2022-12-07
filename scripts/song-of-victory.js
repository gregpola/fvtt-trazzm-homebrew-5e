const version = "0.1.0";
const optionName = "Song of Victory";

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;

		// make sure the actor has Bladesong active
		let effect = actor.data.effects.find(i=> i.data.label === "Bladesong");
		if (!effect) {
			console.log(`${actor.name} - unable to use ${optionName} because Bladesong is not active`);
			return {};
		}			

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// add damage bonus
		const abilityBonus = Math.max(actor.data.data.abilities["int"].mod, 1);
		//let damageType = args[0].item.data.damage.parts[0][1];
		return {damageRoll: `${abilityBonus}`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
