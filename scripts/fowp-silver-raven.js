const version = "10.0.0";
const optionName = "Figurine of Wondrous Power (Silver Raven)";
const actorName = "Raven";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const token = await canvas.tokens.get(args[0].tokenId);
		const summonName = "Silver Raven (" + tactor.name + ")";
		
		// build the update data to match summoned traits
		let updates = {
			token: {
				"name": summonName,
				"disposition": 1,
				"flags": { "midi-srd": { "Silver Raven" : { "ActorId": tactor.id } } }
			},
			"name": summonName
		}

		// Get the summoned actor
		const summonId = "UTR6rv1G8GLWCG5c";
		let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + summonId);
		if (!entity) {
			ui.notifications.error(`${optionName} - unable to find the raven`);
			return false;
		}

		// import the raven
		let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
		if (!document) {
			ui.notifications.error(`${optionName} - unable to import raven from the compendium`);
			return false;
		}
		
		// Spawn the result
		const options = { controllingActor: tactor };
        const summoned = await warpgate.spawn(summonName, updates, {}, options);
		if (!summoned || !summoned[0]) {
			ui.notifications.error(`${optionName} - Unable to spawn the raven`);
			return false;
		}

		// keep track of the spawned critters, so that they can be deleted after the spell expires
		await DAE.setFlag(tactor, optionName, summonName);
	}
	else if (args[0] === "off") {
		let summonName = await DAE.getFlag(tactor, optionName);
		if (summonName) {		
			await MidiMacros.deleteTokens("Silver Raven", tactor);
		}
		await DAE.unsetFlag(tactor, optionName);
		game.actors.forEach(t => { if (!t.folder && (t.name === summonName)) { t.delete(); } });

	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
