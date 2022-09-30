const version = "0.1.0";
const resourceName = "Channel Divinity";
const optionName = "Turn the Unholy";
const targetTypes = ["undead", "fiend"];
const immunity = ["Turn Immunity"];
	
try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow.actor;

	if (args[0].macroPass === "templatePlaced") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName}: ${option} - no resource found`);
		}

		// handle resource consumption
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			if (workflow.targets) {
				workflow.targets.clear();
				game.user.updateTokenTargets(Array.from(workflow.targets).map(t => t.id));
			}
			return ui.notifications.error(`${resourceName}: ${optionName} - out of resources`);
		}
		await consumeResource(actor, resKey, 1);

		// check target types
		for (let target of workflow.targets) {
			let creatureType = target.actor.data.data.details.type;

			// remove targets that are not creatures (aka PCs etc)
			if ((creatureType === null) || (creatureType === undefined)) {
				workflow.targets.delete(target);
			}
			// remove creatures that are not undead 
			else if (!targetTypes.some(type => (target?.actor.data.data.details.type?.value || "").toLowerCase().includes(type))) {
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
			for (let target of targets) {
				const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Channel Divinity: Turn the Unholy', target.actor.uuid);
				if (!hasEffectApplied) {
					await game.dfreds?.effectInterface.addEffect({ effectName: 'Channel Divinity: Turn the Unholy', uuid: target.actor.uuid });
				}
			}
		}
	}
	
} catch (err) {
	console.error(`${args[0].itemData.name} - Turn Undead ${version}`, err);
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
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}
