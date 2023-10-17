const version = "10.0.2";
const optionName = "Conjure Animals";
const summonFlag = "conjure-animals";
const summonId = "FdCL6zWkQCoglDjT";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const sourceItem = await fromUuid(lastArg.origin);
		const spellLevel = Number(args[1]);
		let levelMultiplier = {1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4};
		const multiplier = levelMultiplier[spellLevel];
		let counts = 2*multiplier;
		
		let mightySummoner = false;
		if (actor.items.getName("Mighty Summoner") !== undefined) {
			mightySummoner = true;
		}
		
		// Get the actor
		let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + summonId);
		if (!entity) {
			ui.notifications.error(`${optionName} - unable to find the creature: ${resultData.text}`);
			return;
		}

		// build the update data to match summoned traits
		const summonName = `${entity.name} (${actor.name})`;
		const name = "Summoned (" + entity.name + ")";
		let updates = {
			token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Conjured Animal" : { "ActorId": actor.id } } }
			},
			"name": summonName,
			"system.details": { 
				"type.value": "fey"
			}
		};

		if (mightySummoner) {
			// modify for mighty summoner
			let originalHPFormula = entity.system.attributes.hp.formula;
			let hitDice = originalHPFormula.match(/(\d+)d\d+/)[1];
			if (hitDice === null || hitDice === undefined || hitDice === 0) {
				hitDice = 1;
			}
			const bonusHP = hitDice * 2;
			let newHPFormula = originalHPFormula + "+" + bonusHP;
			updates = {
				token: {
					"name": summonName,
					"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
					"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
					"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
					"bar1": { attribute: "attributes.hp" },
					"actorLink": false,
					"flags": { "midi-srd": { "Conjured Animal" : { "ActorId": actor.id } } }
				},
				"name": summonName,
				"system": {
					"details": { 
						"type.value": "fey"
					},
					"attributes": {
						"hp.formula": newHPFormula
					}
				}
			};
			
		}
		
		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				ui.notifications.error(`${optionName} - unable to import ${resultData.text} from the compendium`);
				return false;
			}
			await warpgate.wait(500);

			// mark attacks as magical
			let weapons = document.items.filter(i => i.type === "weapon");
			if (weapons) {
				for (var w of weapons) {
					let copy_item = duplicate(w.toObject());
					copy_item.system.properties.mgc = true;
					document.updateEmbeddedDocuments("Item", [copy_item]);
				}
			}

			summonActor = game.actors.getName(summonName);
		}

		// Spawn the result
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 60;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			let options = {duplicates: choice[1], collision: true};
			const spawned = await warpgate.spawnAt(position, summonName, {}, { controllingActor: actor }, options);
			if (!spawned || !spawned[0]) {
				ui.notifications.error(`${optionName} - unable to spawn the animals`);
				return false;
			}

			// keep track of the spawned critters, so that they can be deleted after the spell expires
			await actor.setFlag("midi-qol", summonFlag, summonName);
		}
		else {
			ui.notifications.error(`${optionName} - invalid conjure location`);
			return false;
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
    console.error(`${optionName} ${version}`, err);
}
