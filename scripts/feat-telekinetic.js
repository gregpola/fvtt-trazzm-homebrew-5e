const version = "10.0.0";
const optionName = "Telekinetic";
const lastArg = args[args.length - 1];

try {
	let pusher = canvas.tokens.get(args[0].tokenId);
	let targets = args[0].failedSaves;
	if (targets && targets.length > 0) {
		let target = targets[0];
		let targetToken = game.canvas.tokens.get(target.id);
		
		new Dialog({
		  title: `${optionName} - Shove`,
		  content: "Which Shove Action?",
		  buttons: {
			A: { label: "Pull", callback: () => { 
				return MoveToken(pusher, targetToken, -canvas.grid.size);
				ChatMessage.create({'content': `${pusher.name} pulls ${target.name} telekinetically!`});
			} },
			B: { label: "Push", callback: () => { 
				return MoveToken(pusher, targetToken, canvas.grid.size); 
				ChatMessage.create({'content': `${pusher.name} pushes ${target.name} telekinetically!`});
			} },
		  }
		}).render(true);
		
	}	

} catch (err) {
    console.error(`Telekinetic shove ${version}`, err);
}

async function MoveToken(sourceToken, targetToken, movePixels) {
	const ray = Ray.fromAngle(templateDoc.x, templateDoc.y, templateDoc.direction/360, templateDoc.distance)
	
	// check for collision
	const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetToken});
	if(!isAllowedLocation) {
		// too far, check for 5-feet
		let shorterCenter = ray.project((ray.distance + (movePixels/2))/ray.distance);
		const isShorterAllowed = canvas.effects.visibility.testVisibility({x: shorterCenter.x, y: shorterCenter.y}, {object: targetToken});
		
		if (!isShorterAllowed) {
			return ChatMessage.create({content: `${targetToken.name} hits a wall`});
		}
		newCenter = shorterCenter;
	}
	
	// finish the push
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
}
