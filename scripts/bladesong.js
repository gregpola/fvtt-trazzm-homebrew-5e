const version = "0.1.0";
const optionName = "Bladesong"

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		
		// make sure the character is not wearing medium armor, heavy armor, or a shield
		let armor = tactor.items.filter(i => ((i.data.type === `equipment`) && i.data.data.equipped && ["medium","heavy","shield"].includes(i.data.data.armor?.type)));
		if (armor && armor.length > 0) {
			ui.notifications.error(`${optionName}: unable to activate because you have an ineligible item equipped`);
			return false;
		}
		
		return true;
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
