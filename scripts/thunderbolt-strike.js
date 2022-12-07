const version = "0.1.0";
const optionName = "Thunderbolt Strike";

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const target = args[0].hitTargets[0];
		let tactor = target?.actor;
		const ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
		let pusher = canvas.tokens.get(args[0].tokenId);

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}
		
		// check the damage type
		if (workflow.damageDetail.filter(i=>i.type === "lightning").length < 1) {
			console.log(`${optionName} - not lightning damage`);
			return {};
		}
			
		// check the target's size, must be Large or smaller
		const tsize = tactor.data.data.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			console.log(`${resourceName} - target is too large to push`);
			return {};
		}

		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Use ${optionName} to push the target?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/lightning/fist-unarmed-strike-blue.webp" width="30" height="30"></>',
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
		
		let useFeature = await dialog;
		if (useFeature) {
			// Push the target
			await pushTarget(pusher, ttoken);
		}
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function pushTarget(sourceToken, targetToken) {
	let newCenter = getAllowedPushLocation(sourceToken, targetToken, 2);
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
