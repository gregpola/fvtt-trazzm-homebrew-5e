const version = "11.0";
const optionName = "Shadow Walk";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = workflow.item.system.range.value ?? 120;
		
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, workflow.item, token);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - token.width / 2, position.y - token.height / 2, 1);
			if (HomebrewMacros.checkPosition(token, newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return false;
			}

			const portalScale = token.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.02.dark_black")       
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

