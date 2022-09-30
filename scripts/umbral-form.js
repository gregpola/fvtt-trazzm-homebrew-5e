const version = "0.1.0";
const resourceName = "Sorcery Points";
const optionName = "Umbral Form";
const cost = 6;

try {

	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - resource not found`);
			return false;
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points || (points < cost)) {
			ui.notifications.error(`${resourceName} - Not enough points for ${optionName}`);
			return false;
		}
		
		await consumeResource(actor, resKey, cost);
		
	}
	
} catch (err) {
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

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}
