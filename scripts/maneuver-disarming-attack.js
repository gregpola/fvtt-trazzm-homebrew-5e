const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Disarming Attack";

try {
	if (args[0].macroPass === "preambleComplete") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}
		
		consumeResource(actor, resKey, 1);
		
		// add buff to the character
		const effectData = {
			label: optionName,
			icon: "icons/magic/control/debuff-chains-shackles-movement-purple.webp",
			origin: args[0].item.uuid,
			changes: [
				{
					key: 'data.bonuses.weapon.damage',
					mode: CONST.ACTIVE_EFFECT_MODES.ADD,
					value: actor.data.data.scale["battle-master"]["superiority-die"],
					priority: 21
				}
			],
			flags: {
				dae: {
					selfTarget: true,
					stackable: "none",
					durationExpression: "",
					macroRepeat: "none",
					specialDuration: [
						"1Attack"
					],
					transfer: false
				}
			},
			disabled: false
		};
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
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
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}
