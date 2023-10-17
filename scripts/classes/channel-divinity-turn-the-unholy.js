/*
	As an action, you present your holy symbol and speak a prayer censuring fiends and undead, using your Channel Divinity. Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes damage.

	A turned creature must spend its turns trying to move as far away from you as it can, and it can’t willingly move to a space within 30 feet of you. It also can’t take reactions. For its action, it can use only the Dash action or try to escape from an effect that prevents it from moving. If there’s nowhere to move, the creature can use the Dodge action.
*/
const version = "10.1";
const resourceName = "Channel Divinity";
const optionName = "Turn the Unholy";
const targetTypes = ["undead", "fiend"];
const immunity = ["Turn Immunity"];
const conditionName = "Channel Divinity: Turn the Unholy";

try {
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
		await consumeResource(actor, resKey, 1);
		
	}
	else if (args[0].macroPass === "preambleComplete") {
		// check target types
		for (let target of workflow.targets) {
			let creatureType = target.actor.system.details.type;

			// remove targets that are not applicable creatures (aka PCs etc)
			if ((creatureType === null) || (creatureType === undefined)) {
				workflow.targets.delete(target);
			}
			// remove creatures that are not undead or fiends
			else if (!targetTypes.some(type => (target?.actor.system.details.type?.value || "").toLowerCase().includes(type))) {
				workflow.targets.delete(target);
			}
			// remove creatures with turn immunity
			else if (target.actor.items.find(i => immunity.includes(i.name))) {
				workflow.targets.delete(target);
			}
		}

		game.user.updateTokenTargets(Array.from(workflow.targets).map(t => t.id));
	}
	else if (args[0].macroPass === "postSave") {
		let targets = workflow.failedSaves;
		if (targets && targets.length > 0) {
			for (let target of targets) {
				const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied(conditionName, target.actor.uuid);
				if (!hasEffectApplied) {
					await game.dfreds.effectInterface.addEffect({
						'effectName': conditionName,
						'uuid': target.actor.uuid,
						'origin': workflow.origin,
						'overlay': false
					});
				}
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
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
