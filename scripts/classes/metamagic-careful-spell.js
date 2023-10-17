/*
	When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.
*/
const version = "10.0.0";
const optionName = "Careful Spell";
const resourceName = "Sorcery Points";
const cost = 1;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		// check max targets
		let maxTargets = Math.max(actor.system.abilities.cha.mod, 1);
		if (lastArg.workflow.preSelectedTargets.length > maxTargets) {
			ui.notifications.error(`${optionName} - too many targets selected to protect`);
			return false;
		}
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName} - resource pool is empty`);
			return false;
		}

		await consumeResource(actor, resKey, cost);
	}
	
} catch (err)  {
    console.error(`Metamagic: ${optionName} ${version}`, err);
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
