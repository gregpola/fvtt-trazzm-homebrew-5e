const version = "11.0";
const optionName = "Fey Step";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = item.system.range.value ?? 30;

		// transport the caster		
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, token);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - token.width / 2, position.y - token.height / 2, 1);
			if (HomebrewMacros.checkPosition(token, newCenter.x, newCenter.y)) {
				return ui.notifications.error(`${optionName} - can't teleport on top of another token`);
			}
			
			const portalScale = token.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.01.green")       
				.atLocation(token)
				.scale(portalScale)
				.fadeOut(200)
				.wait(500)
				.thenDo(() => {
					canvas.pan(position)
				})
				.animation()
				.on(token)
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
			ui.notifications.error(`${optionName} - invalid fey step location`);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
