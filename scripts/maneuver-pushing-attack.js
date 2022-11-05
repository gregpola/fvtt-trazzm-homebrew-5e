const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Pushing Attack";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let target = args[0].hitTargets[0];
		let tactor = target?.actor;
		let ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
		let pusher = canvas.tokens.get(args[0].tokenId);

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak","rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}
		
		// make sure they have superiority dice remaining
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName}: no resource found`);
			return {};
		}
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${optionName}: out of resource`);
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
						icon: '<p> </p><img src = "icons/equipment/hand/gauntlet-plate-gold.webp" width="50" height="50"></>',
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
				ui.notifications.info(`${resourceName} - target is too large to push`);
			}
			else {
				const abilityBonus = Math.max(actor.data.data.abilities.str.mod, actor.data.data.abilities.dex.mod);
				const dc = 8 + actor.data.data.attributes.prof + abilityBonus;
				const flavor = `${CONFIG.DND5E.abilities["str"]} DC${dc} ${optionName || ""}`;
				let saveRoll = (await tactor.rollAbilitySave("str", {flavor})).total;
				if (saveRoll < dc) { 
					await pushTarget(pusher, ttoken);
				}
			}
			
			// add damage bonus
			const diceMult = args[0].isCritical ? 2: 1;
			let damageType = args[0].item.data.damage.parts[0][1];
			return {damageRoll: `${diceMult}${supDie}[${damageType}]`, flavor: optionName};
		}
		
	}

	return{};
	
} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

async function pushTarget(sourceToken, targetToken) {
	let newCenter = getAllowedPushLocation(sourceToken, targetToken, 3);
	if(!newCenter) {
		return ui.notifications.error(`${resourceName} - no room to push ${targetToken.name}`);
	}
	const tobj = targetToken.document.object;
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - tobj.w / 2, newCenter.y - tobj.h / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
}

function getAllowedPushLocation(sourceToken, targetToken, maxSquares) {
	for (let i = maxSquares; i > 0; i--) {
		const knockbackPixels = i * canvas.grid.size;
		const ray = new Ray(sourceToken.center, targetToken.center);
		const newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
		const isAllowedLocation = canvas.sight.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetToken.Object});
		if(isAllowedLocation) {
			return newCenter;
		}
	}
	
	return null;
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
