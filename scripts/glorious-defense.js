const version = "0.1.0";
const optionName = "Glorious Defense";

try {
	if (args[0].macroPass === "preambleComplete") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;
		let targetUuid = args[0].targets[0].uuid;
		let target = args[0].targets[0];
		let tactor = target?.actor;
		if (!actor || !target) {
			return ui.notifications.error(`${optionName} - no target selected`);
		}
		
		// calculate the AC bonus
		let acBonus = Math.floor(actor.data.data.abilities.cha.mod, 1);
		const currentAC = tactor.data.data.attributes.ac.value;
		const newAC = currentAC + acBonus;
		ChatMessage.create({'content': `${optionName} - ${actor.name} provides an AC bonus of ${acBonus} to ${tactor.name}, making their AC ${newAC}. Did it block the attack?`});

	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
