const version = "10.0.0";
const optionName = "Metallic Breath Weapon - Repulsion";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let pusher = canvas.tokens.get(args[0].tokenId);
		let targets = args[0].failedSaves;
		if (targets && targets.length > 0) {
			for (let target of targets) {
				await PushToken(pusher, target);
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function PushToken(sourceToken, targetDoc) {
	let squaresPushed = 4;
	let knockbackPixels = squaresPushed * canvas.grid.size;
	const ray = new Ray(sourceToken.center, targetDoc.object.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	
	// check for collision
	const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetDoc.Object});
	while(!isAllowedLocation) {
		// too far, reduce by 5-feet
		squaresPushed--;
		knockbackPixels = squaresPushed * canvas.grid.size;
		let shorterCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
		const isShorterAllowed = canvas.effects.visibility.testVisibility({x: shorterCenter.x, y: shorterCenter.y}, {object: targetDoc.Object});
		
		if (isShorterAllowed) {
			newCenter = shorterCenter;
			isAllowedLocation = true;
		}
		
		// check for exit condition
		if (squaresPushed === 1) break;			
	}
	
	// finish the push
	if (isAllowedLocation) {
		newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetDoc.object.w / 2, newCenter.y - targetDoc.object.h / 2, 1);
		const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
		await warpgate.mutate(targetDoc, mutationData, {}, {permanent: true});
	}
	else {
		return ChatMessage.create({content: `${targetDoc.name} has no valid location it can be pushed to`});
	}
}
