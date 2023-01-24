const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Precision Attack";

try {
	const lastArg = args[args.length - 1];
	const workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);

	if (lastArg.macroPass === "preCheckHits") {
		const theItem = workflow;

		if ((theItem != null) && (theItem.name != "Combat Maneuver (Precision Attack)")) {
			// define Actor, Target and Item
			const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

			// Find resource
			let resKey = findResource(actor);
			if (!resKey) {
				console.log(`${optionName} : ${resourceName} - no resource found`);
				return {};
			}

			const points = actor.system.resources[resKey].value;
			if (!points) {
				console.log(`${optionName} : ${resourceName} - resource pool is empty`);
				return {};
			}

			// check to make sure only one target is selected
			if ((lastArg.targetUuids.length < 1) || (lastArg.targetUuids.length > 1)) {
				ui.notifications.error("You need to select a single target.");
				return;
			}

			const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
			if (!fullSupDie) {
				return ui.notifications.error(`${actor.name} does not have a superiority die`);
			}

			// make sure the attempted hit was made with a weapon attack
			if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
				console.log(`${optionName}: not an eligible attack`);
				return {};
			}
			
			if (!["mwak", "rwak"].includes(lastArg.item.data.actionType)) {
				console.log("Precision Attack only works with a weapon attack");
				return;
			}

			// create a dialog and prompt to spend a superiority die
			let useSuperiorityDie = false;
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					// localize this text
					title: `Combat Maneuver: ${optionName}`,
					content: `<p>Use ${optionName}? (${points} superiority dice remaining)</p>`,
					buttons: {
						one: {
							icon: '<p> </p><img src = "icons/skills/melee/strike-blade-knife-blue-red.webp" width="30" height="30"></>',
							label: "<p>Yes</p>",
							callback: () => resolve(true)
						},
						two: {
							icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
							label: "<p>No</p>",
							callback: () => { resolve(false) }
						}
					},
					default: "two"
				}).render(true);
			});
			useSuperiorityDie = await dialog;

			if (!useSuperiorityDie) return;

			// if YES subtract a superiorty die
			await consumeResource(actor, resKey, 1);

			// get the live MIDI-QOL workflow so we can make changes
			let newRoll = new Roll(`${workflow.attackRoll.result} + ${fullSupDie.die}`, workflow.actor.getRollData());
			newRoll = await newRoll.evaluate({ async: true });
			workflow.attackRoll = newRoll;
			workflow.attackRollTotal = newRoll.total;
			workflow.attackRollHTML = await workflow.attackRoll.render(newRoll);
			return;
		}
	}
	return;

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
