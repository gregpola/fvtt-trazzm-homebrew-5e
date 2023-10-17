const version = "10.0.0";
const resourceName = "Bardic Inspiration";
const optionName = "Cutting Words";
const cost = 1;

try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	
	if (args[0].macroPass === "preItemRoll") {
		let actor = workflow.actor;
		let target = args[0].targets[0];
		let tactor = target?.actor;

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		if (!await consumeResource(actor, resKey, 1)) {
			return false;
		}
		
		// get the actor scale value
		const inspirationDie = actor.system.scale["bard"]["inspiration"];
		const cuttingWordsRoll = await new Roll(`${inspirationDie}`).evaluate({ async: true });
		if (game.dice3d) game.dice3d.showForRoll(cuttingWordsRoll);
		ChatMessage.create({content: `${optionName} - ${actor.name} applies cutting words debuff of ${cuttingWordsRoll.total} to ${tactor.name}`});
		return true;		
	}
	
} catch (err)  {
    console.error(`${optionName} ${version}`, err);
}

// find the resource matching this feature
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
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
