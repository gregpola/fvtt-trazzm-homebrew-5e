const version = "0.1.0";

try {
	let pusher = canvas.tokens.get(args[0].tokenId);
	let targets = args[0].failedSaves;
	if (targets && targets.length > 0) {
		for (let target of targets) {
			await PushToken(pusher, target);
		}
	}	

} catch (err) {
    console.error(`Thunderwave push ${version}`, err);
}

async function PushToken(sourceToken, targetDoc) {
	const knockbackPixels = 2 * canvas.grid.size;
	const ray = new Ray(sourceToken.center, targetDoc.object.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	
	// check for collision
	const isAllowedLocation = canvas.sight.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetDoc.Object});
	if(!isAllowedLocation) {
		// too far, check for 5-feet
		let shorterCenter = ray.project((ray.distance + (knockbackPixels/2))/ray.distance);
		const isShorterAllowed = canvas.sight.testVisibility({x: shorterCenter.x, y: shorterCenter.y}, {object: targetDoc.Object});
		
		if (!isShorterAllowed) {
			return ChatMessage.create({content: `${targetDoc.name} hits a wall`});
		}
		newCenter = shorterCenter;
	}
	
	// finish the push
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetDoc.object.w / 2, newCenter.y - targetDoc.object.h / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetDoc, mutationData, {}, {permanent: true});
}
