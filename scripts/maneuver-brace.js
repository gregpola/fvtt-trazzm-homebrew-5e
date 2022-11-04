const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Brace";

try {
		
	if (args[0] === "on") {
		let actor = MidiQOL.MQfromActorUuid(args[1].actorUuid);

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}
		consumeResource(actor, resKey, 1);
	}
	else if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;
		let target = args[0].targets[0];

		if (!["mwak"].includes(args[0].item.data.actionType)) {
			console.log('Not an allowed attack for ${optionName}');
			return {};
		}

		if (!actor || !target) {
		  console.log('${optionName} damage: no target selected');
		  return;
		}
		
		// Add superiority die to the damage
		let damageType = args[0].item.data.damage.parts[0][1];
		const fullSupDie = actor.data.data.scale["battle-master"]["superiority-die"];
		const supDie = fullSupDie.substr(fullSupDie.indexOf('d'));
		return {damageRoll: `${supDie}[${damageType}]`, flavor: "Brace Maneuver Damage"};		
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
