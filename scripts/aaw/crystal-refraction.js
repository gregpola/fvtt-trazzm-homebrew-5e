const version = "0.1.0";
const resourceName = "Crystal Points";
const optionName = "Crystal Refraction";
const optionCost = 1;

try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow.actor;
	
	if (args[0] === "preItemRoll") {
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
                        return false;
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName} - resource pool is empty`);
			return false;
		}
		
		await consumeResource(actor, resKey, optionCost);
	}
	

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
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