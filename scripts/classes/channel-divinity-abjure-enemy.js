/*
	As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose
	one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw, unless it is
	immune to being Frightened. Fiends and undead have disadvantage on this saving throw.

	On a failed save, the creature is Frightened for 1 minute or until it takes any damage. While frightened, the creature’s
	speed is 0, and it can’t benefit from any bonus to its speed.

	On a successful save, the creature’s speed is halved for 1 minute or until the creature takes any damage.
 */
const version = "11.1";
const optionName = "Abjure Enemy";
const channelDivinityName = "Channel Divinity (Paladin)";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check Channel Divinity uses available
		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		if (channelDivinity) {
			let usesLeft = channelDivinity.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${channelDivinityName} uses left`);
			}
			else {
				const newValue = channelDivinity.system.uses.value - cost;
				await channelDivinity.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
		}

		return false;
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
