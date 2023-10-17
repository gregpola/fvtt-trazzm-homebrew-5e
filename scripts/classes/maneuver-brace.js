const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Brace";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(tactor, resKey, 1);
	}
	else if (args[0].macroPass === "DamageBonus") {
		let target = lastArg.targets[0];

		if (!["mwak"].includes(lastArg.itemData.system.actionType)) {
			console.log('Not an allowed attack for ${optionName}');
			return {};
		}

		if (!tactor || !target) {
		  console.log('${optionName} damage: no target selected');
		  return;
		}
		
		// Add superiority die to the damage
		let damageType = lastArg.itemData.system.damage.parts[0][1];
		const fullSupDie = tactor.system.scale["battle-master"]["superiority-die"];
		return {damageRoll: `${fullSupDie.die}[${damageType}]`, flavor: "Brace Maneuver Damage"};		
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
