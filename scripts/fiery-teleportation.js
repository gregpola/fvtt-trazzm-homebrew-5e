const version = "0.1.0";
const optionName = "Fiery Teleportation";

try {

	if (args[0].macroPass === "postDamageRoll") { // preItemRoll
		// get the friends that are coming along
		const potentialTargets = MidiQOL.findNearby(1, token, 5, null);
		let movedFriends = [
			{
				token: token,
				xdiff: 0,
				ydiff: 0
			}
		];

		if (potentialTargets) {
			for (let friendToken of potentialTargets) {
				movedFriends.push({
					token: friendToken,
					xdiff: friendToken.center.x - token.center.x,
					ydiff: friendToken.center.y - token.center.y
				});
			}
		}
		
		const maxRange = 15;
        let snap = token.data.width/2 === 0 ? 1 : -1;
        let {x, y} = await MidiMacros.warpgateCrosshairs(token, maxRange, optionName, token.data.img, token.data, snap);
		
		for (let friend of movedFriends) {
			let pos = canvas.grid.getSnappedPosition(x + friend.xdiff - 5, y + friend.ydiff - 5, 1);
			await friend.token.document.update(pos, {animate : false});
		}		
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
