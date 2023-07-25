const version = "10.1";
const optionName = "Swarming Dispersal";

try {
	const lastArg = args[args.length - 1];
	
	let msgHistory = game.messages.reduce((list, message) => {
		let damage = message.flags?.midiqol?.undoDamage;
		if (damage) list.push(damage);
		return list;
	}, []);
	let lastAttack = msgHistory[msgHistory.length - 1];
	let attackData = lastAttack.find(i=> i.tokenId === lastArg.tokenId);
	
	// gather up the damage types
	//lastArg.damageDetail[0].type
	//let damageType = attackData.damageItem.damageDetail[0][0].type;
	
	if (args[0].macroPass === "postActiveEffects") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		let gameRound = game.combat ? game.combat.rounds : 0;
		let itemD = lastArg.item;
		
		let effectDataResistance = [{
			label: itemD.name,
			icon: itemD.img,
			changes: [
				{ key: 'system.traits.dr.all', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1', priority: 20 }
			],
			origin: lastArg.uuid,
			disabled: false,
			duration: { rounds: 1, seconds: 6, startTime: game.time.worldTime, startRound: gameRound },
			flags: { dae: { specialDuration: ["isDamaged"] } },
		}]
		await actor.createEmbeddedDocuments("ActiveEffect", effectDataResistance);
		
		// prompt for teleport location
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, 30, lastArg.item, actorToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - actorToken.width / 2, position.y - actorToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(actorToken, newCenter.x, newCenter.y)) {
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
				.file("jb2a.misty_step.02.green")
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
    console.error(`${optionName}: ${version}`, err);
}
