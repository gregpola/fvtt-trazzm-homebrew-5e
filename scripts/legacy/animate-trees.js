/*
	The treant magically animates one or two trees it can see within 60 feet of it. These trees have the same statistics as a treant, except they have Intelligence and Charisma scores of 1, they can't speak, and they have only the Slam action option. An animated tree acts as an ally of the treant. The tree remains animate for 1 day or until it dies; until the treant dies or is more than 120 feet from the tree; or until the treant takes a bonus action to turn it back into an inanimate tree. The tree then takes root if possible.
*/
const version = "12.3.0";
const optionName = "Animate Trees";
const summonFlag = "animated-trees";
const summonId = "dvQ8Wpl9C416Adnq";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0] === "on") {
		// get the summoned critter
		let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + summonId);
		if (!entity) {
			ui.notifications.error(`${optionName} - unable to find the summon creature`);
			return;
		}

		// build the update data to match summoned traits
		const summonName = `Animated Tree (${actor.name})`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": token.document.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
			},
			"name": summonName
		};

		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				return ui.notifications.error(`${optionName} - unable to import the animated tree from the compendium`);
			}
			await HomebrewMacros.wait(500);
			summonActor = game.actors.getName(summonName);
		}

		// Spawn the result
		const maxRange = item.system.range.value ? item.system.range.value : 60;

		const portal = await new Portal()
			.addCreature(summonActor, {updateData: updates , count: 2})
			.color("#ff0000")
			.texture(summonActor.prototypeToken.texture.src)
			.origin(token)
			.range(maxRange);

		const spawned = await portal.spawn();
		if (spawned) {
			await actor.setFlag(_flagGroup, summonFlag, summonName);

			for (let i = 0; i < spawned.length; i++) {
				let spawnDocument = spawned[i];
				await spawnDocument.toggleCombatant();
				await spawnDocument.actor.rollInitiative();
			}
		}
	}
	else if (args[0] === "off") {
		// delete the summons
		const summonName = actor.getFlag(_flagGroup, summonFlag);
		if (summonName) {
			await actor.unsetFlag(_flagGroup, summonFlag);

			let tokens = canvas.tokens.ownedTokens.filter(i => i.name === summonName);
			if (tokens) {
				await canvas.scene.deleteEmbeddedDocuments("Token", tokens.map(t=>t.id));
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
