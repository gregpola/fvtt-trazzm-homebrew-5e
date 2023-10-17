const version = "10.0.0";
const resourceName = "Channel Divinity";
const optionName = "Keening";
	
try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const targetActor = lastArg.hitTargets[0].actor;
	const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName}: ${option} - no resource found`);
			return false;
		}

		// handle resource consumption
		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName}: ${optionName} - out of resources`);
			return false;
		}
		
		await consumeResource(actor, resKey, 1);
	}
	
} catch (err) {
	console.error(`${args[0].itemData.name} - Turn Undead ${version}`, err);
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
