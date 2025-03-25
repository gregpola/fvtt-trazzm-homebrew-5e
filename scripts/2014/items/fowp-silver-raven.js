const version = "10.0.2";
const optionName = "Figurine of Wondrous Power (Silver Raven)";
const actorName = "Raven";
const creatureName = "Silver Raven";
const summonFlag = "silver-raven";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const summonName = `${creatureName} (${actor.name})`;

		// build the update data to match summoned traits
		let updates = {
			token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Silver Raven" : { "ActorId": actor.id } } }
			},
			"name": summonName
		}

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "UTR6rv1G8GLWCG5c";
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + summonId);
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

		const options = { controllingActor: actor };
		const result = await warpgate.spawn(summonName,  updates, {}, options);
		if (result.length !== 1) {
			return;
		}

		let summonToken = canvas.tokens.get(result[0]);
		if (summonToken) {
			await actor.setFlag("midi-qol", summonFlag, summonToken.id);
			// players can't do the following:
			//await spiritToken.toggleCombat();
			//await spiritToken.actor.rollInitiative();
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
