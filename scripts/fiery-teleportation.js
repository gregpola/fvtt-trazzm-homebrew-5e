const version = "10.0.2";
const optionName = "Fiery Teleportation";
const maxRange = 15;

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);

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
		const position = await HomebrewMacros.warpgateCrosshairs(actorToken, 15, lastArg.item, actorToken);
		if (position) {
			// check for token collision
			let newCenter = canvas.grid.getSnappedPosition(position.x - actorToken.width / 2, position.y - actorToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of a token`);
				return;
			}

			const portalScale = actorToken.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.02.red")       
				.atLocation(actorToken)
				.scale(portalScale)
				.fadeOut(200)
				.wait(500)
				.thenDo(() => {
					canvas.pan(position)
				})
				.animation()
				.on(actorToken)
				.teleportTo(position, { relativeToCenter: true })
				.fadeIn(200)
				.effect()
				.file("jb2a.misty_step.02.blue")
				.atLocation({x: position.x, y: position.y})
				.scale(portalScale)
				.anchor(0.5,0.5)
				.play();
				
			// transport the companions
			for (let friend of movedFriends) {
				let pos = canvas.grid.getSnappedPosition(position.x + friend.xdiff - 5, position.y + friend.ydiff - 5, 1);
				await friend.token.document.update(pos, {animate : false});
			}		
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return false;
		}
		
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
