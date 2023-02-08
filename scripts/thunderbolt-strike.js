/*
	At 6th level, when you deal lightning damage to a Large or smaller creature, you can also push it up to 10 feet away from you.
*/
const version = "10.0.0";
const optionName = "Thunderbolt Strike";

try {
	if (args[0].macroPass === "DamageBonus") {	
		const lastArg = args[args.length - 1];
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// check the damage type
		if (lastArg.workflow.damageDetail.filter(i=>i.type === "lightning").length < 1) {
			console.log(`${optionName} - not lightning damage`);
			return {};
		}
			
		// check the target's size, must be Large or smaller
		const tsize = targetActor.system.traits.size;
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
			await pushTarget(actorToken, targetToken);
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
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
		const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetToken.Object});
		if(isAllowedLocation) {
			return newCenter;
		}
	}
	
	return null;
}
