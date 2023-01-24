const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Trip Attack";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
		let actor = workflow?.actor;
		let target = lastArg.hitTargets[0];
		let ttoken = canvas.tokens.get(target.object.id);
		
		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
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
						icon: '<p> </p><img src = "icons/equipment/feet/boots-collared-simple-brown.webp" width="30" height="30"></>',
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
			await consumeResource(actor, resKey, 1);
			
			// todo check the target's size, must be Large or smaller
			const tsize = target.actor.system.traits.size;
			if (!["tiny","sm","med","lg"].includes(tsize)) {
				ui.notifications.info(`${resourceName} - target is too large to trip`);
			}
			else {
				const abilityBonus = Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod);
				const dc = 8 + actor.system.attributes.prof + abilityBonus;
				
				const flavor = `${CONFIG.DND5E.abilities["str"]} DC${dc} ${optionName || ""}`;
				let saveRoll = await target.actor.rollAbilitySave("str", {flavor});
				await game.dice3d?.showForRoll(saveRoll);				

				if (saveRoll.total < dc) { 
					ChatMessage.create({'content': `${actor.name} trips ${target.name}!`});
					const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', target.actor.uuid);
					if (!hasEffectApplied) {
						const uuid = target.actor.uuid;
						await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid });
					}
				} else {
					ChatMessage.create({'content': `${actor.name} fails to trip ${target.name}`});
				}
			}
			
			// add damage bonus
			const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
			const diceMult = lastArg.isCritical ? 2: 1;
			let damageType = lastArg.itemData.system.damage.parts[0][1];
			return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`Combat Maneuver: ${optionName} ${version}`, err);
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
