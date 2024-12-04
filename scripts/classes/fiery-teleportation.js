const version = "12.3.0";
const optionName = "Fiery Teleportation";
const maxRange = 15;

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the friends that are coming along
		const potentialTargets = MidiQOL.findNearby(1, token, 5);
		let movedFriends = [];

		if (potentialTargets) {
			for (let friendToken of potentialTargets) {
				movedFriends.push({
					token: friendToken,
					xdiff: friendToken.center.x - token.center.x,
					ydiff: friendToken.center.y - token.center.y
				});
			}
		}

		// transport the Wildfire Spirit
		const maxRange = item.system.range.value ?? 60;
		let position = await HomebrewMacros.teleportToken(token, maxRange);

		// transport the companions
		if (position) {
			for (let friend of movedFriends) {
				let pos = canvas.grid.getSnappedPosition(position.x + friend.xdiff - 5, position.y + friend.ydiff - 5, 1);
				await friend.token.document.update(pos, {animate : false});
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
