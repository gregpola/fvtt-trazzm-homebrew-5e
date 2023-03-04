/*
	You cause a cloud of mites, fleas, and other parasites to appear momentarily on one creature you can see within range. The target must succeed on a Constitution saving throw, or it takes 1d6 poison damage and moves 5 feet in a random direction if it can move and its speed is at least 5 feet. Roll a d4 for the direction: 1, north; 2, south; 3, east; or 4, west. This movement doesn’t provoke opportunity attacks, and if the direction rolled is blocked, the target doesn’t move.
*/
const version = "10.0.0";
const optionName = "Infestation";
const directions = [0, 0, 180, 90, 270];

try {
	const lastArg = args[args.length - 1];

	if ((args[0].macroPass === "postActiveEffects") && (lastArg.failedSaves.length > 0)) {
		let itemData = lastArg.itemData;
		const targetToken = game.canvas.tokens.get(lastArg.failedSaves[0].id);
		
		// move target
		let directionRoll = new Roll(`1d4`).evaluate({ async: false });
		await moveTarget(targetToken, directionRoll.total);
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function moveTarget(targetToken, direction) {
	const distance = canvas.grid.size;
	const angle = directions[direction] * (Math.PI/180);
	const ray = Ray.fromAngle(targetToken.center.x, targetToken.center.y, angle, distance);
	let projection = ray.project(1);
	
	let newCenter = canvas.grid.getSnappedPosition(projection.x - targetToken.width / 2, projection.y - targetToken.height / 2, 1);
	if (!HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
		const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
		await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
	}
	else {
		ui.notifications.error(`${optionName} - invalid move location`);
		return;
	}
}
