/*
	Starting at 10th level, you can use your action to increase your powers of perception. When you do so, choose one of the following benefits, which lasts until you are Incapacitated or you take a short or long rest. You can’t use the feature again until you finish a rest.

	* Darkvision.You gain Darkvision out to a range of 60 feet.
	* Ethereal Sight.You can see into the Ethereal Plane within 60 feet of you.
	* Greater Comprehension. You can read any language.
	* See Invisibility. You can see Invisible creatures and objects within 10 feet of you that are within line of sight.
*/
const version = "10.0.0";
const optionName = "The Third Eye";
const lastArg = args[args.length - 1];

try {
	if (args[0] === "on") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		//const actorToken = canvas.tokens.get(lastArg.tokenId);

		// build the radio options
		let options = new Set();
		options.add({ type: "radio", 
			label: 'Darkvision', 
			value: 'darkvision', 
			options: "group1" });
			
		options.add({ type: "radio", 
			label: 'Ethereal Sight', 
			value: 'ethereal-sight', 
			options: "group1" });
			
		options.add({ type: "radio", 
			label: 'Greater Comprehension', 
			value: 'greater-comprehension', 
			options: "group1" });
			
		options.add({ type: "radio", 
			label: 'See Invisibility', 
			value: 'see-invisibility', 
			options: "group1" });
		
		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "Grant", value: true },
			{ label: "Cancel", value: false }
		];
		menuOptions["inputs"] = Array.from(options);
		let choice = await warpgate.menu(menuOptions, 
			{ title: `${optionName}: which option do you want?`, options: { height: "100%", width: "150px" } });
		let targetButton = choice.buttons;

		if (targetButton) {
			let selectedOption = choice.inputs.filter(Boolean);
			switch (selectedOption[0]) {
				case "darkvision":
					await applyDarkvision(actor, lastArg.sourceItemUuid);
					break;
				case "ethereal-sight":
					await applyEtherealSight(actor, lastArg.sourceItemUuid);
					break;
				case "greater-comprehension":
					await applyGreaterComprehension(actor, lastArg.sourceItemUuid);
					break;
				case "see-invisibility":
					await applySeeInvisibility(actor, lastArg.sourceItemUuid);
					break;
			}
		}
	}
	else if (args[0] === "off") {
		let effect = actor?.effects.find(ef => ef.label === optionName);
		if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDarkvision(actor, origin) {
	const effectData = {
		label: optionName,
		icon: "icons/magic/perception/eye-slit-orange.webp",
		origin: origin,
		changes: [
			{
				"key": "ATL.dimSight",
				"mode": 4,
				"value": "60",
				"priority": 20
			},
			{
				"key": "ATL.sight.visionMode",
				"mode": 4,
				"value": "darkvision",
				"priority": 20
			},
			{
				"key": "ATL.detectionModes.basic.range",
				"mode": 4,
				"value": "60",
				"priority": 20
			},
			{
				"key": "system.attributes.senses.darkvision",
				"mode": 4,
				"value": "60",
				"priority": 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				selfTargetAlways: true,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"shortRest",
		            "longRest"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}

async function applyEtherealSight(actor, origin) {
	const effectData = {
		label: optionName,
		icon: "icons/magic/perception/eye-tendrils-web-purple.webp",
		origin: origin,
		changes: [],
		flags: {
			dae: {
				selfTarget: false,
				selfTargetAlways: true,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"shortRest",
		            "longRest"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}

async function applyGreaterComprehension(actor, origin) {
	const effectData = {
		label: optionName,
		icon: "icons/sundries/documents/document-letter-formal-tan.webp",
		origin: origin,
		changes: [
			{
				key: 'system.traits.languages.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: '1',
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				selfTargetAlways: true,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"shortRest",
		            "longRest"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}

async function applySeeInvisibility(actor, origin) {
	const effectData = {
		label: optionName,
		icon: "icons/tools/scribal/lens-blue.webp",
		origin: origin,
		changes: [
			{
				key: 'ATL.detectionModes.seeInvisibility.range',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: '60',
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				selfTargetAlways: true,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"shortRest",
		            "longRest"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
