/*
	The feral power within you increases, causing the natural weapons of your Form of the Beast to count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.

	You can also alter your form to help you adapt to your surroundings. When you finish a short or long rest, choose one of the following benefits, which lasts until you finish your next short or long rest:

	Climbing. You gain a climbing speed equal to your walking speed, and you can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.

	Jumping. When you jump, you can make a Strength (Athletics) check and extend your jump by a number of feet equal to the check’s total. You can make this special check only once per turn.

	Swimming. You gain a swimming speed equal to your walking speed, and you can breathe underwater.
*/
const version = "10.0.0";
const optionName = "Bestial Soul";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		// Ask which alteration to take
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>Which Alteration?</p>",
				buttons: {
					climbing: {
						icon: '<img src = "icons/creatures/invertebrates/spider-dotted-green.webp" width="50" height="50" />',
						label: "<p>Climbing</p>",
						callback: () => { resolve("climbing") }
					},
					jumping: {
						icon: '<img src = "icons/creatures/amphibians/bullfrog-glass-teal.webp" width="50" height="50" />',
						label: "<p>Jumping</p>",
						callback: () => { resolve("jumping") }
					},
					swimming: {
						icon: '<img src = "icons/creatures/fish/fish-carp-green.webp" width="50" height="50" />',
						label: "<p>Swimming</p>",
						callback: () => { resolve("swimming") }
					}
				},
				default: "bite"
			}).render(true);
		});

		let alterationName = await dialog;
		if (alterationName) {
			if (alterationName === "climbing") {
				await applyClimbingAlteration(actorToken, lastArg.sourceItemUuid);
			}
			else if (alterationName === "jumping") {
				await applyJumpingAlteration(actorToken, lastArg.sourceItemUuid);
			}
			else if (alterationName === "swimming") {
				await applySwimmingAlteration(actorToken, lastArg.sourceItemUuid);
			}
		}
	}
	else if (args[0] === "off") {
		let effect = actor?.effects.find(ef => ef.label === optionName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyClimbingAlteration(actorToken, origin) {
	const effectData = {
		label: optionName + " - Climbing",
		icon: "icons/creatures/invertebrates/spider-dotted-green.webp",
		origin: origin,
		changes: [
			{
				key: 'system.attributes.movement.climb',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: '@attributes.movement.walk',
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

async function applyJumpingAlteration(actorToken, origin) {
	const effectData = {
		label: optionName + " - Jumping",
		icon: "icons/creatures/amphibians/bullfrog-glass-teal.webp",
		origin: origin,
		changes: [
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

async function applySwimmingAlteration(actorToken, origin) {
	const effectData = {
		label: optionName + " - Swimming",
		icon: "icons/creatures/fish/fish-carp-green.webp",
		origin: origin,
		changes: [
			{
				key: 'system.attributes.movement.swim',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: '@attributes.movement.walk',
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
