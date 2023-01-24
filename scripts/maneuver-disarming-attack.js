const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Disarming Attack";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;
		let target = lastArg.hitTargets[0];
		let tactor = target?.actor;

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName} : ${resourceName} - no resource found`);
			return {};
		}

		const points = actor.system.resources[resKey].value;
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
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-black.webp" width="30" height="30"></>',
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
			consumeResource(actor, resKey, 1);
			
			// apply the damage bonus
			const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
			const abilityBonus = Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod);
			const dc = 8 + actor.system.attributes.prof + abilityBonus;
			const flavor = `${CONFIG.DND5E.abilities["str"]} DC${dc} ${optionName}`;
			let saveRoll = (await tactor.rollAbilitySave("str", {flavor})).total;
			if (saveRoll < dc) {
				// TODO give the player a choice of items to drop
				//await dropAnItem(args...);
				ChatMessage.create({'content': `Combat Maneuver: ${optionName} - ${tactor.name} drops an item`});
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
