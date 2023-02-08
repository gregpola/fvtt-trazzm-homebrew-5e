const version = "10.0.1";
const optionName = "Fey Step (Spring)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		let targetToken = canvas.tokens.get(lastArg.tokenId);
		const maxRange = 30;
		
		if (lastArg.targets.length > 0) {
			targetToken = game.canvas.tokens.get(lastArg.targets[0].id);
		}

		// transport the target
		let position = await HomebrewMacros.warpgateCrosshairs(targetToken, maxRange, lastArg.item, targetToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - targetToken.width / 2, position.y - targetToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return false;
			}
			
			const portalScale = targetToken.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.01.green")       
				.atLocation(targetToken)
				.scale(portalScale)
				.fadeOut(200)
				.wait(500)
				.thenDo(() => {
					canvas.pan(position)
				})
				.animation()
				.on(targetToken)
				.teleportTo(position, { relativeToCenter: true })
				.fadeIn(200)
				.effect()
				.file("jb2a.misty_step.02.blue")
				.atLocation({x: position.x, y: position.y})
				.scale(portalScale)
				.anchor(0.5,0.5)
				.play();
		}
		else {
			ui.notifications.error(`${optionName} - invalid teleport location`);
			return false;
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
