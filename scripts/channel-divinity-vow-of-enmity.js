const version = "0.1.0";
const resourceName = "Channel Divinity";
const optionName = "Vow of Enmity"

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		const points = tactor.data.data.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName} - resource pool is empty`);
			return false;
		}
		
	}
	else if (args[0].macroPass === "preAttackRoll") {
		const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid)
		const tactor = (Array.from(workflow.targets))[0]?.actor;
		if (tactor?.effects.find(i=>i.data.label === optionName)) {
			workflow.advantage = "true";
		}
	}
	
} catch (err) {
	console.error(`${resourceName}: ${optionName} ${version}`, err);
}

// find the resource
function findResource(actor) {
	if (actor) {
		for (let res in actor.data.data.resources) {
			if (actor.data.data.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}
