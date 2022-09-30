const version = "0.1.0";

try {
	let pusher = canvas.tokens.get(args[0].tokenId);
	let targets = args[0].failedSaves;
	if (targets && targets.length > 0) {
		let target = targets[0];
		await PushToken(pusher, target);
		ChatMessage.create({'content': `${pusher.name} pushes ${target.name} telekinetically!`});
	}	

} catch (err) {
    console.error(`Telekinetic shove ${version}`, err);
}

async function PushToken(sourceToken, targetToken) {
	const knockbackPixels = canvas.grid.size;

	const ray = new Ray(sourceToken.center, targetToken.object.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	const isAllowedLocation = canvas.sight.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetToken.Object});
	if(!isAllowedLocation) return ChatMessage.create({content: `${targetToken.name} hits a wall`});
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.object.w / 2, newCenter.y - targetToken.object.h / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetToken, mutationData, {}, {permanent: true});
}
