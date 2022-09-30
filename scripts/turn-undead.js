const version = "0.1.0";
const resourceName = "Channel Divinity";
const optionName = "Turn Undead";
const targetTypes = ["undead"];
const immunity = ["Turn Immunity"];
	
try {
	if (args[0].macroPass === "templatePlaced") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		
		// check resources
		let actor = workflow.actor;
		let resKey = findResource(actor);
		if (!resKey) {
			ChatMessage.create(`Channel Divinity: ${optionName} - no resource found`);
			return;
		}

		// handle resource consumption
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': 'Channel Divinity : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - 1, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.

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
			let maxCR = getDestroyCR(actor);
			let minDamage = 0;
			let destroyedTargets = new Set();

			for (let target of targets) {
				if (target.actor.data.data.details.cr < maxCR) {
					let maxHP = Number(target.actor.data.data.attributes.hp.max);
					if (minDamage < maxHP) {
						minDamage = maxHP;
					}
					destroyedTargets.add(target);
				}
			}
			
			// Are any targets below the destroy threshold?
			if (destroyedTargets.size > 0 ) {
				let damageRoll = await new Roll(`${minDamage}d1`).evaluate({async: true});
				await new MidiQOL.DamageOnlyWorkflow(actor, workflow.token.document, damageRoll.total, "magic", [...destroyedTargets], 
					damageRoll, {flavor: "Destroy Undead", itemCardId: args[0].itemCardId});
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
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

function getDestroyCR(actor) {
	let crDestroy = 0.0;
	let actorClass = actor.classes.cleric.data.data.levels;
	if (actorClass > 16) crDestroy = 4;
	else if (actorClass > 13) crDestroy = 3;
	else if (actorClass > 10) crDestroy = 2;
	else if (actorClass > 7) crDestroy = 1;
	else if (actorClass > 4) crDestroy = 0.5;
	return crDestroy;
}
