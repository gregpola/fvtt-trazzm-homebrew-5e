const version = "10.0.0";

try {
	const lastArg = args[args.length - 1];
	let pusher = canvas.tokens.get(lastArg.tokenId);
	let targets = lastArg.failedSaves;
	if (targets && targets.length > 0) {
		for (let target of targets) {
			await PushToken(pusher, target);
		}
	}	

} catch (err) {
    console.error(`Thunderwave push ${version}`, err);
}

async function PushToken(sourceToken, targetDoc) {
	let targetToken = game.canvas.tokens.get(targetDoc.id);
	const knockbackPixels = 2 * canvas.grid.size;
	const ray = new Ray(sourceToken.center, targetToken.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	
	// check for collision
	const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetDoc});
	if(!isAllowedLocation) {
		// too far, check for 5-feet
		let shorterCenter = ray.project((ray.distance + (knockbackPixels/2))/ray.distance);
		const isShorterAllowed = canvas.effects.visibility.testVisibility({x: shorterCenter.x, y: shorterCenter.y}, {object: targetDoc});
		
		if (!isShorterAllowed) {
			return ChatMessage.create({content: `${targetDoc.name} hits a wall`});
		}
		newCenter = shorterCenter;
	}
	
	// finish the push
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetDoc.width / 2, newCenter.y - targetDoc.height / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetDoc, mutationData, {}, {permanent: true});
}
