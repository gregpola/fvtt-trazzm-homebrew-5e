const version = "10.0.2";
const optionName = "Driftglobe";
const summonFlag = "item-driftglobe";
const creatureName = "Driftglobe";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "postActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const summonName = "Driftglobe (" + actor.name + ")";
		
		// build the update data to match summoned traits
		let updates = {
			token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Driftglobe" : { "ActorId": actor.id } } }
			},
			"name": summonName
		}

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "NrrPquZMkjsm79kZ";
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
			await warpgate.wait(1000);
		}
		
		// Spawn the result
		const options = { controllingActor: actor };
        const result = await warpgate.spawn(summonName, updates, {}, options);
		if (!result || !result[0]) {
			ui.notifications.error(`${optionName} - Unable to spawn`);
			return false;
		}

		let summonedToken = canvas.tokens.get(result[0]);
		if (summonedToken) {
			await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
			// players can't do the following:
			//await summonedToken.toggleCombat();
			//await summonedToken.actor.rollInitiative();
		}
		
	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await actor.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
