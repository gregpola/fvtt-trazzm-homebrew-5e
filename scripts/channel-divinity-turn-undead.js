const version = "10.0";
const resourceName = "Channel Divinity";
const optionName = "Turn Undead";
const targetTypes = ["undead"];
const immunity = ["Turn Immunity"];
	
try {
	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		
		// check resources
		let actor = workflow.actor;
		let resKey = findResource(actor);
		if (!resKey) {
			ChatMessage.create(`${resourceName}: ${optionName} - no resource found`);
			return false;
		}

		// handle resource consumption
		const points = actor.system.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${resourceName}: Out of resources'});
			return false;
		}
		await consumeResource(actor, resKey, 1);
		
	}
	else if (args[0].macroPass === "preambleComplete") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);

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
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;

		let targets = args[0].failedSaves;
		if (targets && targets.length > 0) {
			let maxCR = getDestroyCR(actor);

			for (let target of targets) {
				if (target.actor.system.details.cr <= maxCR) {
					await target.actor.update({"system.attributes.hp.value": 0});
				}
				else {
					const uuid = target.actor.uuid
					const hasEffectApplied = game.dfreds.effectInterface.hasEffectApplied('Channel Divinity: Turn Undead', uuid);
					if (!hasEffectApplied) await game.dfreds.effectInterface.addEffect({ effectName: 'Channel Divinity: Turn Undead', uuid });
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
		const resourcePath = `system.resources.${resKey}`;
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
