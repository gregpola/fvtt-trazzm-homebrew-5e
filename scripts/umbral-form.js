const version = "10.0.0";
const resourceName = "Sorcery Points";
const optionName = "Umbral Form";
const cost = 6;

try {
	if (args[0].macroPass === "preItemRoll") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - resource not found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points || (points < cost)) {
			ui.notifications.error(`${resourceName} - Not enough points for ${optionName}`);
			return false;
		}
		
		await consumeResource(actor, resKey, cost);
		
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
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
