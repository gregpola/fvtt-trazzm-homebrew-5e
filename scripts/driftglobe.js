const version = "10.0.0";
const optionName = "Driftglobe";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "postActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const token = await canvas.tokens.get(args[0].tokenId);
		const summonName = "Driftglobe (" + tactor.name + ")";
		
		// build the update data to match summoned traits
		let updates = {
			token: {
				"name": summonName,
				"disposition": 1,
				"flags": { "midi-srd": { "Driftglobe" : { "ActorId": tactor.id } } }
			},
			"name": summonName
		}

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "UUSx9D38sPiufeLw";
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
		}
		
		// Spawn the result
		const options = { controllingActor: tactor };
        const summoned = await warpgate.spawn(summonName, updates, {}, options);
		if (!summoned || !summoned[0]) {
			ui.notifications.error(`${optionName} - Unable to spawn`);
			return false;
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
