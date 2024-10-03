/*
	Up to four vines the kyton can see within 60 feet of it magically sprout thorns and animate under the kyton’s control.

	Each animated vine is an object with AC 20, 20 hit points, resistance to piercing damage, and immunity to psychic and thunder damage. When the kyton uses multiattack on its turn, it can use each animated vine to make one additional thorn vine attack.

	An animated vine can grapple one creature of its own but can’t make attacks while grappling. An animated vine reverts to its inanimate state if reduced to 0 hit points or if the kyton is incapacitated or dies.
*/
const version = "12.3.0";
const optionName = "Animate Vines";
const summonFlag = "animated-vines";
const summonId = "I176AV0yK9dNOXrY";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0] === "on") {
		// get the summoned critter
		let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors.Actor." + summonId);
		if (!entity) {
			return ui.notifications.error(`${optionName} - unable to find the summon creature`);
		}

		// build the update data to match summoned traits
		const summonName = `Animated Vines (${actor.name})`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": token.document.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false
			},
			"name": summonName
		};

		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				return ui.notifications.error(`${optionName} - unable to import vines from the compendium`);
			}
			await HomebrewMacros.wait(500);
			summonActor = game.actors.getName(summonName);
		}

		// Spawn the result
		const maxRange = item.system.range.value ? item.system.range.value : 60;

		const portal = await new Portal()
			.addCreature(summonActor, {updateData: updates , count: 4})
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
