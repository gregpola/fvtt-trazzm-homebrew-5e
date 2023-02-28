/*
	The treant magically animates one or two trees it can see within 60 feet of it. These trees have the same statistics as a treant, except they have Intelligence and Charisma scores of 1, they can't speak, and they have only the Slam action option. An animated tree acts as an ally of the treant. The tree remains animate for 1 day or until it dies; until the treant dies or is more than 120 feet from the tree; or until the treant takes a bonus action to turn it back into an inanimate tree. The tree then takes root if possible.
*/
const version = "10.0.0";
const optionName = "Animate Trees";
const summonFlag = "animated-trees";
const summonId = "dvQ8Wpl9C416Adnq";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module");
		
		const sourceItem = await fromUuid(lastArg.origin);

		// build the update data to match summoned traits
		const summonName = `Animated Tree (${actor.name})`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": actorToken.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Animated Tree" : { "ActorId": actor.id } } }
			},
			"name": summonName
		};
		
		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// Get from the compendium
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
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}
		
		// Spawn the result
		const maxRange = 60;
		let summonError = false;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			let options = {duplicates: 2, collision: true};
			const spawned = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, options);
			if (!spawned || !spawned[0]) {
				ui.notifications.error(`${optionName} - unable to spawn the trees`);
				return false;
			}

			// keep track of the spawned critters, so that they can be deleted after the spell expires
			await actor.setFlag("midi-qol", summonFlag, summonName);
			
			let summonedToken;
			for (var i = 0; i < spawned.length; i++) {
				summonedToken = canvas.tokens.get(spawned[i]);
				if (summonedToken) {
					await summonedToken.toggleCombat();
					await summonedToken.actor.rollInitiative();
				}
			}
			/*
			if (summonedToken) {
				await summonedToken.actor.rollInitiative();
			}
			*/
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
		}
	}
	else if (args[0] === "off") {
		// delete the summons
		const summonName = actor.getFlag("midi-qol", summonFlag);
		if (summonName) {
			await actor.unsetFlag("midi-qol", summonFlag);
			
			let tokens = canvas.tokens.ownedTokens.filter(i => i.name === summonName);
			for (let i = 0; i < tokens.length; i++) {
				await warpgate.dismiss(tokens[i].id, game.canvas.scene.id);
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
