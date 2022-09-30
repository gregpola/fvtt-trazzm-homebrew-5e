const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Precision Attack";

const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);

if (args[0].macroPass === "preCheckHits") {
    const theItem = workflow;

    if ((theItem != null) && (theItem.name != "Combat Maneuver (Precision Attack)")) {
        // define Actor, Target and Item
        const actor = MidiQOL.MQfromActorUuid(args[0].actorUuid);

		// Find resource
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName}: no resource found`);
			return {};
		}
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${optionName}: out of resource`);
			return {};
		}

        // check to make sure only one target is selected
        if ((args[0].targetUuids.length < 1) || (args[0].targetUuids.length > 1)) {
            ui.notifications.error("You need to select a single target.");
            return;
        }

		const supDie = actor.data.data.scale["battle-master"]["superiority-die"];
        if (!supDie) {
            return ui.notifications.error(`${actor.name} does not have a superiority die`);
        }

        // make sure the attempted hit was made with a weapon attack
        if (!["mwak", "rwak"].includes(args[0].item.data.actionType)) {
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
						icon: '<p> </p><img src = "icons/skills/melee/strike-blade-knife-blue-red.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
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
        let newRoll = new Roll(`${workflow.attackRoll.result} + ${supDie}`, workflow.actor.getRollData());
        newRoll = await newRoll.evaluate({ async: true });
        workflow.attackRoll = newRoll;
        workflow.attackRollTotal = newRoll.total;
        workflow.attackRollHTML = await workflow.attackRoll.render(newRoll);
        return;
    }
}
return;

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
