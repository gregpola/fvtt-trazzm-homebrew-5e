const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Trip Attack";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let target = args[0].hitTargets[0];
		let tactor = target?.actor;
		
		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak","rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
			return;
		}		
		
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Combat Maneuver: ${optionName}`,
				content: `<p>Use ${optionName}? (${points} superiority dice remaining)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/equipment/feet/boots-collared-simple-brown.webp" width="50" height="50"></>',
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
			const supDie = actor.data.data.scale["battle-master"]["superiority-die"].substr(1);
			
			// todo check the target's size, must be Large or smaller
			const tsize = tactor.data.data.traits.size;
			if (!["tiny","sm","med","lg"].includes(tsize)) {
				ui.notifications.info(`${resourceName} - target is too large to trip`);
			}
			else {
				const dc = 8 + actor.data.data.attributes.prof + actor.data.data.abilities.str.mod; // or dex
				const flavor = `${CONFIG.DND5E.abilities["str"]} DC${dc} ${optionName || ""}`;
				let saveRoll = (await tactor.rollAbilitySave("str", {flavor})).total;
				if (saveRoll < dc) { 
					ChatMessage.create({'content': `${actor.name} trips ${tactor.name}!`});
					const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', tactor.uuid);
					if (!hasEffectApplied) {
						const uuid = tactor.uuid;
						await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid });
					}
				} else {
					ChatMessage.create({'content': `${actor.name} fails to trip ${tactor.name}`});
				}
			}
			
			// add damage bonus
			const diceMult = args[0].isCritical ? 2: 1;
			let damageType = args[0].item.data.damage.parts[0][1];
			return {damageRoll: `${diceMult}${supDie}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`Combat Maneuver: ${optionName} ${version}`, err);
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
