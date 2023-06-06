/*
	As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear
	you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for
	1 minute or until it takes any damage.

	A turned creature must spend its turns trying to move as far away from you as it can, and it can’t willingly move to
	a space within 30 feet of you. It also can’t take reactions. For its action, it can use only the Dash action or try
	to escape from an effect that prevents it from moving. If there’s nowhere to move, the creature can use the Dodge action.
 */
const version = "10.1";
const resourceName = "Channel Divinity";
const optionName = "Turn Undead";
const targetTypes = ["undead"];
const immunity = ["Turn Immunity"];
	
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
			// remove creatures that are not undead 
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
		let targets = args[0].failedSaves;
		if (targets && targets.length > 0) {
			let maxCR = getDestroyCR(actor);

			for (let target of targets) {
				if (target.actor.system.details.cr <= maxCR) {
					await target.actor.update({"system.attributes.hp.value": 0});
				}
				else {
					await game.dfreds.effectInterface.addEffect({
						'effectName': 'Channel Divinity: Turn Undead',
						'uuid': target.actor.uuid,
						'origin': workflow.origin,
						'overlay': false
					});
				}
			}
		}
		else {
			console.log("No targets failed their save");
		}		
	}
	
} catch (err) {
	console.error(`${args[0].itemData.name} - Turn Undead ${version}`, err);
}

function findResource(actor) {
	for (let res in actor.system.resources) {
		if (actor.system.resources[res].label === resourceName) {
		  return res;
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
			return;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
	}
}

function getDestroyCR(actor) {
	let crDestroy = 0.0;
	let actorClass = actor.classes.cleric.system.levels;
	if (actorClass > 16) crDestroy = 4;
	else if (actorClass > 13) crDestroy = 3;
	else if (actorClass > 10) crDestroy = 2;
	else if (actorClass > 7) crDestroy = 1;
	else if (actorClass > 4) crDestroy = 0.5;
	return crDestroy;
}
