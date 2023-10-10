const version = "11.0";
const resourceName = "Channel Divinity";
const optionName = "Vow of Enmity"

try {
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(actor, resKey, 1);
	}
	else if (args[0].macroPass === "preAttackRoll") {
		const actorEffect = actor?.effects.find(i=>i.name === optionName);
		const targetEffect = workflow.targets.first()?.actor.effects.find(i=>i.name === optionName && i.origin === actorEffect?.origin);

		if (actorEffect && targetEffect) {
			workflow.advantage = "true";
		}
	}
	
} catch (err) {
	console.error(`${resourceName}: ${optionName} ${version}`, err);
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
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
