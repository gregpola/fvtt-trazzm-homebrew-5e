const version = "10.0.1";
const optionName = "Fey Step (Summer)";
const maxRange = 30;

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		const maxRange = lastArg.item.system.range.value ?? 30;

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
				.file("jb2a.misty_step.01.blue")       
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
				.file("jb2a.misty_step.02.red")
				.atLocation({x: position.x, y: position.y})
				.scale(portalScale)
				.anchor(0.5,0.5)
				.play();
		}
		else {
			ui.notifications.error(`${optionName} - invalid teleport location`);
			return false;
		}
			
		await wait(1000);
		const potentialTargets = MidiQOL.findNearby(null, actorToken, 5, null);
		if (potentialTargets.length === 0) {
			console.log(`${optionName} - no targets within 5 feet for flames`);
			return;
		}

		const pb = actor.system.attributes.prof;
		let damageRoll = await new Roll(`${pb}[fire]`).evaluate({async: false});
		await new MidiQOL.DamageOnlyWorkflow(actor, actorToken.document, pb, "fire", potentialTargets, 
			damageRoll, {flavor: `${optionName}`, itemCardId: lastArg.itemCardId});
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); });}