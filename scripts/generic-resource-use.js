const version = "0.1.0";
const resourceName = "Bardic Inspiration";
const optionName = "Peerless Skill";
const cost = 1;

try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	
	if (args[0].macroPass === "preActiveEffects") {
		// check resources
		let actor = workflow.actor;
		let resKey = findResource(actor);
			if (!resKey) {
			ChatMessage.create(`${optionName} - no resource found`);
			return;
		}

		// handle resource consumption
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${optionName} : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
	
} catch (err)  {
    console.error(`${optionName} ${version}`, err);
}

function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}
