/*
	The drow magically summons a Glabrezu or a Yochlol. The summoned creature appears in an unoccupied space within 60 feet of its summoner, acts as an ally of its summoner, and can’t summon other demons. It remains for 10 minutes, until it or its summoner dies, or until its summoner dismisses it as an action.
*/
const version = "11.0";
const optionName = "Summon Servant";
const summonFlag = "summon-servant";
const summonOptionsFlag = "summon-servant-options";
const yochlolId = "qWBgPJinjzUn0DWK";
const glabrezuId = "QqQNy4xaRXtjsSW2";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0].macroPass === "preItemRoll") {
		// Ask which summon option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `Summon which type of demon?`,
				buttons: {
					Glabrezu: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Glabrezu.webp" width="50" height="50"/>',
						label: "<p>Glabrezu</p>",
						callback: async () => {
							await actor.setFlag(_flagGroup, summonOptionsFlag, {name: "Glabrezu", summonId: glabrezuId});
							resolve(true);
						}
					},
					Yochlol: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Yochlol.webp" width="50" height="50"/>',
						label: "<p>Yochlol</p>",
						callback: async () => {
							await actor.setFlag(_flagGroup, summonOptionsFlag, {name: "Yochlol", summonId: yochlolId});
							resolve(true);
						}
					},
					cancel: {
						label: "<p>Cancel</p>",
						callback: () => { 
							resolve(false);
						}
					}
				},
				default: "cancel"
			}).render(true);
		});

		let result = await dialog;
		return result;
		
	}
	else if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module");

		// pull the summon info from the flag
		const summonData = actor.getFlag(_flagGroup, summonOptionsFlag);
		if (!summonData) {
			return ui.notifications.error(`${optionName}: no summon data`);
		}
		await actor.unsetFlag(_flagGroup, summonOptionsFlag);

		// build the update data to match summoned traits
		const summonName = `${summonData.name} (${actor.name})`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": token.document.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "fvtt-trazzm-homebrew-5e": { "Summoned Demon" : { "ActorId": actor.id } } }
			},
			"name": summonName
		};
		
		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// Get from the compendium
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + summonData.summonId);
			if (!entity) {
				ui.notifications.error(`${optionName} - unable to find the actor`);
				return false;
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonData.summonId, updates);
			if (!document) {
				ui.notifications.error(`${optionName} - unable to import from the compendium`);
				return false;
			}
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}
		
		// Spawn the result
		const maxRange = 60;
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(summonActor, newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return false;
			}

			const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, {});
			if (!result || !result[0]) {
				ui.notifications.error(`${optionName} - Unable to spawn`);
				return false;
			}

			let summonedToken = canvas.tokens.get(result[0]);
			if (summonedToken) {
				await anime(token, summonedToken);
				await actor.setFlag(_flagGroup, summonFlag, summonedToken.id);
				await summonedToken.toggleCombat();
				await summonedToken.actor.rollInitiative();
			}
			
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return false;
		}
	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = actor.getFlag(_flagGroup, summonFlag);
		if (lastSummon) {
			await actor.unsetFlag(_flagGroup, summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.01.red")       
        .atLocation(target)
		.scaleToObject(1)
		.play();
}