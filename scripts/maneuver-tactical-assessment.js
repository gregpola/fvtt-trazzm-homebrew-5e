const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Tactical Assessment";

try {
	if (args[0] === "on") {
		let grappler = canvas.tokens.get(args[1].tokenId);
		let defender = Array.from(game.user.targets)[0];
		
		// check resources
		let resKey = findResource(grappler.actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = grappler.actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
			return;
		}		
		consumeResource(grappler.actor, resKey, 1);		
	}

} catch (err) {
    console.error(`Combat Maneuver: ${optionName} ${version}`, err);
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
