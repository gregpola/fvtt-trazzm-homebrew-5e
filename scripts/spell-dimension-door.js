const version = "10.0.1";
const optionName = "Dimension Door";
const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = await canvas.tokens.get(lastArg.tokenId);
		const maxRange = lastArg.item.system.range.value ?? 500;
		
		// ask if they want to bring an ally along
		// find nearby allies
		let companion = null;
		const friendlyTargets = MidiQOL.findNearby(1, actorToken, 5, 0);
		let friend_content = ``;
		for (let friend of friendlyTargets) {
			friend_content += `<option value=${friend.id}>${friend.name}</option>`;
		}

		if (friend_content.length > 0) {
			let content = `
				<div class="form-group">
				  <label><p>Who would you like to take with you?</p></label>
				  <select name="friends">
					${friend_content}
				  </select>
				  <br />
				</div>`;
				
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: `${optionName}`,
					content,
					buttons:
					{
						pick: {
							label: `Go`,
							callback: async (html) => {
								let friendId = html.find('[name=friends]')[0].value;
								const token = await canvas.tokens.get(friendId);
								resolve(token);
							}
						},
						none: {
							label: `Nobody`,
							callback: () => { resolve(null) }
						}
					}
				}).render(true);
			});

			companion = await dialog;				
		}
		
		// get the companion offset from the caster
		let xdiff = 0;
		let ydiff = 0;
		if (companion) {
			xdiff = companion.center.x - actorToken.center.x;
			ydiff = companion.center.y - actorToken.center.y;
		}

		// transport the caster
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
				.file("jb2a.misty_step.01.green")       
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

			// transport the companion
			if (companion) {
				let compPosition = duplicate(position);
				compPosition.x += xdiff;
				compPosition.y += ydiff;
				
				new Sequence()
					.effect()
					.file("jb2a.misty_step.01.yellow")       
					.atLocation(companion)
					.scale(portalScale)
					.fadeOut(200)
					.wait(500)
					.animation()
					.on(companion)
					.teleportTo(compPosition, { relativeToCenter: true })
					.fadeIn(200)
					.effect()
					.file("jb2a.misty_step.02.blue")
					.atLocation({x: compPosition.x, y: compPosition.y})
					.scale(portalScale)
					.anchor(0.5, 0.5)
					.play();
			}
		}
		else {
			ui.notifications.error(`${optionName} - invalid teleport location`);
			return false;
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
