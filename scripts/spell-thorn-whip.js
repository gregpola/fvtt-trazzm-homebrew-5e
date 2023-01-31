const version = "10.0.0";
const optionName = "Thorn Whip";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects" && lastArg.hitTargets.length > 0) {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
			
		// check the target's size, must be Large or smaller
		const tsize = targetActor.system.traits.size;
		if (["tiny","sm","med","lg"].includes(tsize)) {
			await pullTarget(actorToken, targetToken);
		}
	}

	return{};
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function pullTarget(sourceToken, targetToken) {
	const movePixels = 2 * canvas.grid.size;
	const ray = new Ray(sourceToken.center, targetToken.center);
	let newCenter = ray.project((ray.distance - movePixels)/ray.distance);
	
	// check for collision
	let c = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
	const isAllowedLocation = !checkPosition(c.x, c.y);
	if(!isAllowedLocation) {
		// too far, check for 5-feet
		let shorterCenter = ray.project((ray.distance - (movePixels/2))/ray.distance);
		c = canvas.grid.getSnappedPosition(shorterCenter.x - targetToken.width / 2, shorterCenter.y - targetToken.height / 2, 1);
		const isShorterAllowed = !checkPosition(c.x, c.y);
		
		if (!isShorterAllowed) {
			return ChatMessage.create({content: `${targetToken.name} unable to pull closer to ${sourceToken.name}`});
		}
		newCenter = shorterCenter;
	}
	
	// finish the pull
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
}

function checkPosition(newX, newY) {
	const hasToken = canvas.tokens.placeables.some(t => {
		const detectX = newX.between(t.document.x, t.document.x + canvas.grid.size * (t.document.width-1));
		const detectY = newY.between(t.document.y, t.document.y + canvas.grid.size * (t.document.height-1));
		return detectX && detectY;
	});
	return hasToken;
}
