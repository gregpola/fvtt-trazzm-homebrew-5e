const version = "10.0.0";
const optionName = "Dimension Door";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects") {
		let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const token = await canvas.tokens.get(lastArg.tokenId);
		const maxRange = lastArg.item.system.range.value ?? 500;
		
		// ask if they want to bring an ally along
		// find nearby allies
		let companion = null;
		const friendlyTargets = MidiQOL.findNearby(1, token, 5, 0);
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
			xdiff = companion.center.x - token.center.x;
			ydiff = companion.center.y - token.center.y;
		}

		// transport the caster
		const tokenCenter = token.center;
		let cachedDistance = 0;

		const checkDistance = async(crosshairs) => {
			while (crosshairs.inFlight) {
				//wait for initial render
				await warpgate.wait(100);
				const ray = new Ray( tokenCenter, crosshairs );
				const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0]

				//only update if the distance has changed
				if (cachedDistance !== distance) {
				  cachedDistance = distance;     
				  if(distance > maxRange) {
					  crosshairs.icon = 'icons/svg/hazard.svg';
				  } else {
					  crosshairs.icon = token.document.texture.src;
				  }

				  crosshairs.draw();
				  crosshairs.label = `${distance} ft`;				  
				}
			}
		};

		const callbacks = {
			show: checkDistance
		};
		
		const config = {
			drawIcon: false,
			interval: token.width % 2 === 0 ? 1 : -1,
			size: token.w / canvas.grid.size
		};

		if (typeof lastArg.item !== 'undefined') {
			config.drawIcon = true;
			config.icon = lastArg.item.img;
			config.label = lastArg.item.name;
		}

		const position = await warpgate.crosshairs.show(config, callbacks);
		
		// check for illegal position
		if (position.cancelled) return;
		if (cachedDistance > maxRange) {
			ui.notifications.error(`${optionName} - has a maximum range of ${maxRange} ft`);
			return;
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
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
