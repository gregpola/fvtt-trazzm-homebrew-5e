/*
When you hit a creature with a weapon attack, you can expend one superiority die to distract the creature, giving your allies an opening. You add the superiority die to the attack’s damage roll. The next attack roll against the target by an attacker other than you has advantage if the attack is made before the start of your next turn.
*/
const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Distracting Strike";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "DamageBonus") {
		let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let target = lastArg.hitTargets[0];

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			console.log(`${optionName} : ${resourceName} - no resource found`);
			return {};
		}

		const points = tactor.system.resources[resKey].value;
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
						icon: '<p> </p><img src = "icons/magic/control/hypnosis-mesmerism-eye-tan.webp" width="30" height="30"></>',
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
		
		let useManeuver = await dialog;
		if (useManeuver) {
			consumeResource(tactor, resKey, 1);
			
			// apply the damage bonus
			const fullSupDie = tactor.system.scale["battle-master"]["superiority-die"];
			ChatMessage.create({'content': `Combat Maneuver: ${optionName} - ${target.name} is distracted by ${actor.name}`});
			
			// apply advantage - doesn't work because the effect ends with this workflow
			//await markGrantsAdvantage(target.actor.uuid, tactor.uuid, lastArg);

			// add damage bonus
			const diceMult = lastArg.isCritical ? 2: 1;
			let damageType = lastArg.item.system.damage.parts[0][1];
			return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

async function markGrantsAdvantage(targetId, actorId, macroData) {
	const effectData = {
		label: "Distracted",
		icon: "icons/magic/control/hypnosis-mesmerism-eye-tan.webp",
		origin: actorId,
		changes: [
			{
				key: 'flags.midi-qol.grants.advantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "1",
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
