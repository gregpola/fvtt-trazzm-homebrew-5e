const version = "10.0.0";
const resourceName = "Ki Points";
const optionName = "Quickened Healing";
const optionCost = 2;

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);
			return false;
		}

		// handle resource consumption
		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName}: ${resourceName}: - out of resources`);
			return false;
		}
				
		if (points < optionCost) {
			ui.notifications.error(`${optionName}: ${resourceName} - not enough points (need ${optionCost})`);
			return false;
		}

		return await consumeResource(actor, resKey, optionCost);
	}	

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
