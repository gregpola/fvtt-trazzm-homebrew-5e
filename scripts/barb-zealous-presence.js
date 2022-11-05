const version = "0.1.0";
const optionName = "Zealous Presence"

try {
	// preambleComplete
	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let targets = args[0].targets;

		if(targets.length === 0 || targets.length > 10) {
			ui.notifications.error(`${optionName} - missing or too many targets`);
			return false;
		}
		
		return true;
	}
	
} catch (err) {
	console.error(`${optionName} ${version}`, err);
}
