const version = "12.3.0";
const optionName = "Conjure Animals";
const summonFlag = "conjure-animals";
const tableIdPrefix = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-roll-tables."
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0] === "on") {
		const spellLevel = Number(args[1]);
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
						callback: () => { resolve(["miJocZLE3qCfokF9", counts[0]]) }

					},
					cr12: {
						label: `<p>CR 1/2</p><p>(${counts[1]})</p>`,
						callback: () => { resolve(["XXS44yKO6Wq9OcpV", counts[1]]) }

					},
					cr1: {
						label: `<p>CR 1</p><p>(${counts[2]})</p>`,
						callback: () => { resolve(["Esun355kxdEXhCQ7", counts[2]]) }

					},
					cr2: {
						label: `<p>CR 2</p><p>(${counts[3]})</p>`,
						callback: () => { resolve(["XSCitVlt24spsFOJ", counts[3]]) }

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
			const table = await fromUuid(tableIdPrefix + choice[0]);

			if (table) {
				const {roll, results} = await table.draw({ displayChat: false });

				if (results) {
					await table.toMessage(results, {roll, messageData: {speaker: {alias: game.user.name}}});

					// get the summoned critter
					const collectionName = results[0].documentCollection;
					const summonId = results[0].documentId;
					let entity = await fromUuid("Compendium." + collectionName + "." + summonId);
					if (!entity) {
						ui.notifications.error(`${optionName} - unable to find the creature: ${results[0].text}`);
						return;
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
							ui.notifications.error(`${optionName} - unable to import ${results[0].text} from the compendium`);
							return;
						}
						await HomebrewMacros.wait(500);
						summonActor = game.actors.getName(summonName);
					}

					// Spawn the result
					const maxRange = item.system.range.value ? item.system.range.value : 20;

					const portal = await new Portal()
						.addCreature(summonActor, {updateData: updates , count: choice[1]})
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
				else {
					ui.notifications.error(`${optionName}: the table result is undefined`);
				}
			}
			else {
				ui.notifications.error(`${optionName}: unable to locate the roll-table in the compendium`);
			}
		}
		else {
			return false;
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
    console.error(`${optionName} ${version}`, err);
}
