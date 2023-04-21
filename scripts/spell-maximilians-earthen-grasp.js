const version = "10.0.2";
const optionName = "Maximilian's Earthen Grasp";
const actorName = "Maximilian's Hand";
const summonFlag = "maximilians-earthen-grasp";

try {
	const lastArg = args[args.length - 1];
	let caster = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
    if (args[0] === "on") {
		const sourceItem = await fromUuid(lastArg.origin);
		const summonName = `${actorName} (${caster.name})`;

        let updates = {
            token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Maximilian's Hand": { "ActorId": caster.id } } }
            },
			"name": summonName,
			embedded: {
				Item: {
					"Grasp": {
						"system.save.dc": caster.system.attributes.spelldc
					},
					"Crush": {
						"system.save.dc": caster.system.attributes.spelldc
					}
				}
            },
        };
		
        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "1IU2SzcYygPCET2y";
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors." + summonId);
			if (!entity) {
				ui.notifications.error(`${optionName} - unable to find the actor`);
				return false;
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				ui.notifications.error(`${optionName} - unable to import from the compendium`);
				return false;
			}
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}

		// spawn the actor
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 30;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't summon on top of another token`);
				return false;
			}

			const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: caster }, {});
			if (!result || !result[0]) {
				ui.notifications.error(`${optionName} - Unable to spawn`);
				return false;
			}

			let summonedToken = canvas.tokens.get(result[0]);
			if (summonedToken) {
				await caster.setFlag("midi-qol", summonFlag, summonedToken.id);
				// players can't do the following:
				//await summonedToken.toggleCombat();
				//await summonedToken.actor.rollInitiative();
			}
			
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return false;
		}

	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = caster.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await caster.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
