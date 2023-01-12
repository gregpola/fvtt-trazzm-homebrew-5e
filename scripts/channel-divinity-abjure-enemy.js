const version = "10.0.0";
const resourceName = "Channel Divinity";
const optionName = "Abjure Enemy";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(tactor, resKey, 1);
	}
	else if (args[0].macroPass === "postSave") {
		const sourceOrigin = args[0]?.tokenUuid;
		let targets = args[0].saves;
		
		if (targets && targets.length > 0) {
			const effectData = {
				label: `${optionName}`,
				icon: "icons/magic/control/fear-fright-monster-purple-blue.webp",
				origin: sourceOrigin,
				duration: {startTime: game.time.worldTime, seconds: 60},
				changes: [
					{
						key: 'system.attributes.movement.walk',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "[[@attributes.movement.walk / 2]]",
						priority: 20
					},
					{
						key: 'system.attributes.movement.fly',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "[[@attributes.movement.fly / 2]]",
						priority: 20
					},
					{
						key: 'system.attributes.movement.swim',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "[[@attributes.movement.swim / 2]]",
						priority: 20
					},
					{
						key: 'system.attributes.movement.climb',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "[[@attributes.movement.climb / 2]]",
						priority: 20
					},
					{
						key: 'system.attributes.movement.burrow',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "[[@attributes.movement.burrow / 2]]",
						priority: 20
					}
				],
				flags: {
					dae: {
						selfTarget: false,
						stackable: "none",
						durationExpression: "",
						macroRepeat: "none",
						specialDuration: ["isDamaged"],
						transfer: false
					}
				},
				disabled: false
			};

			for (let target of targets) {
				const uuid = target.actor.uuid
				// add reduced speed effect
				await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: uuid, effects: [effectData] });
			}
		}

	}
	
} catch (err) {
	console.error(`${resourceName}: ${optionName} ${version}`, err);
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
