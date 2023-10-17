const version = "10.0.1";
const resourceName = "Superiority Dice";
const optionName = "Menacing Attack";

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
		
		// ask if they want to use Goading Attack
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Combat Maneuver: ${optionName}`,
				content: `<p>Use ${optionName}? (${points} superiority dice remaining)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/control/fear-fright-monster-green.webp" width="30" height="30"></>',
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
		
		let useGA = await dialog;
		if (useGA) {
			await consumeResource(tactor, resKey, 1);

			const fullSupDie = tactor.system.scale["battle-master"]["superiority-die"];
			const abilityBonus = Math.max(tactor.system.abilities.str.mod, tactor.system.abilities.dex.mod);
			const dc = 8 + tactor.system.attributes.prof + abilityBonus;
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"]} DC${dc} ${optionName || ""}`;
			let saveRoll = await target.actor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "frightened"});
			await game.dice3d?.showForRoll(saveRoll);

			if (saveRoll.total < dc) {
				await markAsFrightened(target.actor.uuid, tactor.uuid);
			}
			
			// add damage bonus
			const diceMult = lastArg.isCritical ? 2: 1;
			let damageType = lastArg.itemData.system.damage.parts[0][1];
			return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
		}
		
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

async function markAsFrightened(targetId, actorId) {
    let condition = game.i18n.localize("Frightened");

	const effectData = {
		label: condition,
		icon: "icons/magic/control/fear-fright-monster-green.webp",
		origin: actorId,
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Frightened",
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
					"turnEndSource"
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
