const version = "10.0.1";
const optionName = "Conjure Minor Elementals";
const summonFlag = "conjure-minor-elementals";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const sourceItem = await fromUuid(lastArg.origin);
		const spellLevel = Number(args[1]);
		let levelMultiplier = {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 3, 9: 3};
		const multiplier = levelMultiplier[spellLevel];
		let counts = [8*multiplier, 4*multiplier, 2*multiplier, 1*multiplier];
		
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
			let tableName = "Conjure Minor Elementals " + choice[0];
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
			const summonName = `${entity.name} (${actor.name})`;
			let updates = {
				token: {
					"name": summonName,
					"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
					"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
					"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
					"bar1": { attribute: "attributes.hp" },
					"actorLink": false,
					"flags": { "midi-srd": { "Conjured Elemental" : { "ActorId": actor.id } } }
				},
				"name": summonName,
				"system.details": { 
					"type.value": "fey"
				}
			};

			let summonActor = game.actors.getName(summonName);
			if (!summonActor) {
				// import the actor
				let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
				if (!document) {
					ui.notifications.error(`${optionName} - unable to import ${resultData.text} from the compendium`);
					return false;
				}
				await warpgate.wait(500);
				summonActor = game.actors.getName(summonName);
			}

			// Spawn the result
			const tokenData = entity.prototypeToken;
			const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 60;
			let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
			if (position) {
				let options = {duplicates: choice[1], collision: true};
				const spawned = await warpgate.spawnAt(position, summonName, {}, { controllingActor: actor }, options);
				if (!spawned || !spawned[0]) {
					ui.notifications.error(`${optionName} - Unable to spawn the elemental`);
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
		else {
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
    console.error(`${optionName}: ${version}`, err);
}
