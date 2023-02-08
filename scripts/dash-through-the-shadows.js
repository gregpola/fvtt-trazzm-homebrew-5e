const version = "10.0.";
const optionName = "Dash through the Shadows";
const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = await canvas.tokens.get(lastArg.tokenId);
		const maxRange = lastArg.item.system.range.value ?? 60;
		
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, lastArg.item, actorToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - actorToken.width / 2, position.y - actorToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return false;
			}

			const portalScale = actorToken.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.01.dark_black")       
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
				.play();
		}
		else {
			ui.notifications.error(`${optionName} - invalid teleport location`);
			return false;
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
