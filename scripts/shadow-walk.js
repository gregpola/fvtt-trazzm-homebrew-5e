const version = "10.0.0";
const optionName = "Shadow Walk";
const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects") {
		let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const token = await canvas.tokens.get(lastArg.tokenId);
		const maxRange = lastArg.item.system.range.value ?? 120;
		
		// transport the caster
		const tokenCenter = token.center;
		let cachedDistance = 0;

		const checkDistance = async(crosshairs) => {
			while (crosshairs.inFlight) {
				// wait for initial render
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
			.file("jb2a.misty_step.01.dark_black")       
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
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

