const version = "10.0.0";
const optionName = "Conjure Animals";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		let spellLevel = args[0].spellLevel;
		let actor = args[0].actor;
		const token = await canvas.tokens.get(args[0].tokenId);

		let levelMultiplier = {1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4};
		const multiplier = levelMultiplier[spellLevel];
		let counts = [8*multiplier, 4*multiplier, 2*multiplier, 1*multiplier];
		
		let mightySummoner = false;
		if (actor.items.getName("Mighty Summoner") !== undefined) {
			mightySummoner = true;
		}
		
		// Build and display options dialog
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>Which option would you like?</p>",
				buttons:
				{
					cr14: {
						label: `<p>CR 1/4</p><p>(${counts[0]})</p>`,
						callback: () => { resolve(["CR 1/4", counts[0]]) }

					},
					cr12: {
						label: `<p>CR 1/2</p><p>(${counts[1]})</p>`,
						callback: () => { resolve(["CR 1/2", counts[1]]) }

					},
					cr1: {
						label: `<p>CR 1</p><p>(${counts[2]})</p>`,
						callback: () => { resolve(["CR 1", counts[2]]) }

					},
					cr2: {
						label: `<p>CR 2</p><p>(${counts[3]})</p>`,
						callback: () => { resolve(["CR 2", counts[3]]) }

					},
					cancel: {
						label: `Cancel`,
						callback: () => { resolve(null) }
					}
				}
			}).render(true);
		});

		let choice = await dialog;
		if (choice) {
			// get the table
			let tableName = "Conjure Animals " + choice[0];
			const table = game.tables.getName(tableName);
			if (!table) {
				ui.notifications.error(`${optionName} - unable to find the table: ${tableName}`);
				return false;
			}
			
			// roll on the table
			const {roll, results} = await table.draw({ displayChat: false });
			await table.toMessage(results, {roll, messageData: {speaker: {alias: game.user.name}}});
			const resultData = results[0].data;
			const collectionName = resultData.documentCollection;
			const summonId = resultData.documentId;
			
			// Get the actor
			let entity = await fromUuid("Compendium." + collectionName + "." + summonId);
			if (!entity) {
				ui.notifications.error(`${optionName} - unable to find the creature: ${resultData.text}`);
				return false;
			}

			// build the update data to match summoned traits
			const name = "Summoned (" + entity.name + ")";
			let updates = {
				token: {
					"name": name,
					"disposition": 1,
					"flags": { "midi-srd": { "Conjured Animal" : { "ActorId": tactor.id } } }
				},
				"name": name,
				"system.details": { 
					"type.value": "fey"
				}
			}

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
						"name": name,
						"disposition": 1,
						"flags": { "midi-srd": { "Conjured Animal" : { "ActorId": tactor.id } } }
					},
					"name": name,
					system: {
						"details": { 
							"type.value": "fey"
						},
						"attributes": {
							"hp.formula": newHPFormula
						}
					}
				}
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				ui.notifications.error(`${optionName} - unable to import ${resultData.text} from the compendium`);
				return false;
			}
			
			let weapons = document.items.filter(i => i.type === "weapon");
			if (weapons) {
				for (var w of weapons) {
                    let copy_item = duplicate(w.toObject());
					copy_item.system.properties.mgc = true;
                    document.updateEmbeddedDocuments("Item", [copy_item]);
				}
			}

			// Spawn the result
			const tokenData = entity.prototypeToken;
			const maxRange = 60;
			let snap = tokenData.width/2 === 0 ? 1 : -1;
			let {x, y} = await MidiMacros.warpgateCrosshairs(token, maxRange, optionName, tokenData.texture.src, tokenData, snap);

			let options = {duplicates: choice[1], collision: true};
			
			const spawned = await warpgate.spawnAt({ x, y }, name, updates, { controllingActor: actor }, options);
			if (!spawned || !spawned[0]) {
				ui.notifications.error(`${optionName} - Unable to spawn the animal`);
				return false;
			}

			// keep track of the spawned critters, so that they can be deleted after the spell expires
			await DAE.setFlag(tactor, optionName, name);
			
			// If in combat, set combat state and initiative
			// TODO ? set all the same
			if (game.combat) {
				for (const tid of spawned) {
					let theToken = canvas.tokens.get(tid);
					if(theToken) {
						await theToken.toggleCombat();
						await theToken.actor.rollInitiative();
					}
				}
			}

		}
		else {
			return false;
		}

	}
	else if (args[0] === "off") {
		let summonName = await DAE.getFlag(tactor, optionName);
		if (summonName) {		
			await MidiMacros.deleteTokens("Conjured Animal", tactor);
		}
		await DAE.unsetFlag(tactor, optionName);
		game.actors.forEach(t => { if (!t.folder && (t.name === summonName)) { t.delete(); } });

	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
