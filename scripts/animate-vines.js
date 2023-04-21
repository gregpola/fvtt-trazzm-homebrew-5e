/*
	Up to four vines the kyton can see within 60 feet of it magically sprout thorns and animate under the kyton’s control.

	Each animated vine is an object with AC 20, 20 hit points, resistance to piercing damage, and immunity to psychic and thunder damage. When the kyton uses multiattack on its turn, it can use each animated vine to make one additional thorn vine attack.

	An animated vine can grapple one creature of its own but can’t make attacks while grappling. An animated vine reverts to its inanimate state if reduced to 0 hit points or if the kyton is incapacitated or dies.
*/
const version = "10.0.2";
const optionName = "Animate Vines";
const summonFlag = "animated-vines";
const summonId = "I176AV0yK9dNOXrY";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module");
		
		const sourceItem = await fromUuid(lastArg.origin);

		// build the update data to match summoned traits
		const summonName = `Animated Vines (${actor.name})`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": actorToken.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Animated Vines" : { "ActorId": actor.id } } }
			},
			"name": summonName
		};
		
		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// Get from the compendium
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
		
		// Spawn the result
		const maxRange = 60;
		
		for (let x = 0; x < 4; x++) {
			let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
			
			if (position) {
				let options = {collision: true};
				let spawned = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, options);
				if (!spawned || !spawned[0]) {
					ui.notifications.error(`${optionName} - unable to spawn the vine`);
				}

				let summonedToken = canvas.tokens.get(spawned[0]);
				if (summonedToken) {
					await summonedToken.toggleCombat();
					await summonedToken.actor.rollInitiative();
				}
			}			
		}

		// keep track of the spawned critters, so that they can be deleted after the spell expires
		await actor.setFlag("midi-qol", summonFlag, summonName);
		
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
