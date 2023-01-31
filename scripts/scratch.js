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
		let rows = "";
		for (let t of lastArg.damageRoll.terms) {
			let row = `<div class="flexrow"><label>${t.number}d${t.faces}</label>`;
			for (let r of t.results) {
				row += `<input type="checkbox" style="margin-right:10px;" value=${r.result}>${r.result}</input><div>,  </div>`;
				let dieData = [`d${t.faces}`, r.result, false, `${t.options.flavor}`];
				rerollDataSet.add(dieData);
			}
			row += `</div>`;
			rows += row;
		}
