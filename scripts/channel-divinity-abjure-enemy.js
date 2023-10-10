/*
	As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose
	one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw, unless it is
	immune to being Frightened. Fiends and undead have disadvantage on this saving throw.

	On a failed save, the creature is Frightened for 1 minute or until it takes any damage. While frightened, the creature’s
	speed is 0, and it can’t benefit from any bonus to its speed.

	On a successful save, the creature’s speed is halved for 1 minute or until the creature takes any damage.
 */
const version = "11.0";
const resourceName = "Channel Divinity";
const optionName = "Abjure Enemy";

try {
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(actor, resKey, 1);
	}
	else if (args[0].macroPass === "preSave") {
		for(let target of args[0].targets) {
			if (["undead", "fiend"].some(type => (target.actor.system.details.type?.value || "").toLowerCase().includes(type))) {
				const data = {
					changes: [{
						key: "flags.midi-qol.disadvantage.ability.save.all",
						mode: 0,
						priority: 20,
						value: "1"
					}],
					"duration": {"seconds": 1, "turns": 1},
					"flags": {"dae": {"specialDuration": ["isSave"]}},
					"icon": "icons/skills/melee/shield-damaged-broken-orange.webp",
					"name": optionName,
					"origin": workflow.item.uuid
				};
				await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [data]});
			}
		}
	}
	else if (args[0].macroPass === "postSave") {
		const sourceOrigin = args[0]?.tokenUuid;

		// Handle the saved actors that get half movement
		let targets = args[0].saves;
		if (targets && targets.length > 0) {
			const effectData = {
				name: `${optionName}`,
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
				if (!hasFearImmunity(target.actor)) {
					const uuid = target.actor.uuid
					await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: uuid, effects: [effectData]});
				}
			}
		}

		// Handle the save failed actors
		targets = args[0].failedSaves;
		if (targets && targets.length > 0) {
			const fearEffectData = {
				name: `${optionName}`,
				icon: "icons/magic/control/fear-fright-monster-purple-blue.webp",
				origin: sourceOrigin,
				duration: {startTime: game.time.worldTime, seconds: 60},
				changes: [
					{
						key: 'macro.CE',
						mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						value: "Frightened",
						priority: 20
					},
					{
						key: 'system.attributes.movement.walk',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "0",
						priority: 20
					},
					{
						key: 'system.attributes.movement.fly',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "0",
						priority: 20
					},
					{
						key: 'system.attributes.movement.swim',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "0",
						priority: 20
					},
					{
						key: 'system.attributes.movement.climb',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "0",
						priority: 20
					},
					{
						key: 'system.attributes.movement.burrow',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: "0",
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
				if (!hasFearImmunity(target.actor)) {
					const uuid = target.actor.uuid
					await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: uuid, effects: [fearEffectData]});
				}
			}
		}

	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}

function hasFearImmunity(actor) {
	if (actor) {
		return actor.system.traits.ci?.value?.has('frightened');
	}

	return false;
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
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
