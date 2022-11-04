const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Distracting Strike";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;
		let target = args[0].hitTargets[0];
		let tactor = target?.actor;

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak", "rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName} : ${resourceName} - no resource found`);
			return {};
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${optionName} : ${resourceName} - resource pool is empty`);
			return {};
		}
				
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Combat Maneuver: ${optionName}`,
				content: `<p>Use ${optionName}? (${points} superiority dice remaining)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/control/hypnosis-mesmerism-eye-tan.webp" width="50" height="50"></>',
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
		
		let useManeuver = await dialog;
		if (useManeuver) {
			consumeResource(actor, resKey, 1);
			
			// apply the damage bonus
			const fullSupDie = actor.data.data.scale["battle-master"]["superiority-die"];
			const supDie = fullSupDie.substr(fullSupDie.indexOf('d'));
			ChatMessage.create({'content': `Combat Maneuver: ${optionName} - ${tactor.name} is distracted by ${actor.name}`});
			
			// apply disadvantage
			// this doesn't work await markGrantsAdvantage(tactor.uuid, actor.uuid);

			// add damage bonus
			const diceMult = args[0].isCritical ? 2: 1;
			let damageType = args[0].item.data.damage.parts[0][1];
			return {damageRoll: `${diceMult}${supDie}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

async function markGrantsAdvantage(targetId, actorId) {
	const effectData = {
		label: "Distracted",
		icon: "icons/magic/control/hypnosis-mesmerism-eye-tan.webp",
		origin: actorId,
		changes: [
			{
				key: 'flags.midi-qol.grants.advantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 1,
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"isAttacked"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
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
