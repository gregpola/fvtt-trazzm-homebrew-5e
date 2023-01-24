const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Precision Attack";

try {
	const lastArg = args[args.length - 1];
	const workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);

	if (lastArg.macroPass === "preCheckHits") {
		const theItem = workflow;

		if ((theItem != null) && (theItem.name != "Combat Maneuver (Precision Attack)")) {
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}
