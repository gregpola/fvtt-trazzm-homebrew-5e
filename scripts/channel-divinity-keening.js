const version = "0.1.0";
const resourceName = "Channel Divinity";
const optionName = "Keening";
	
try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow.actor;

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName}: ${option} - no resource found`);
			return false;
		}

		// handle resource consumption
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName}: ${optionName} - out of resources`);
			return false;
		}
		
		await consumeResource(actor, resKey, 1);
	}
	
} catch (err) {
	console.error(`${args[0].itemData.name} - Turn Undead ${version}`, err);
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
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}
