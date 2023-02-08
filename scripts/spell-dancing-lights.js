/*
	You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size. Whichever form you choose, each light sheds dim light in a 10-foot radius.

	As a bonus action on your turn, you can move the lights up to 60 feet to a new spot within range. A light must be within 20 feet of another light created by this spell, and a light winks out if it exceeds the spell's range.
*/
const version = "10.0.0";
const optionName = "Dancing Lights";
const summonFlag = "dancing-lights";
const creatureName = "Dancing Light";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) {
			ui.notifications.error("Please enable the Warp Gate module");
			return;
		}
		
		const sourceItem = await fromUuid(lastArg.origin);
		const summonName = `${creatureName} (${actor.name})`;
		
		// build the update data to match summoned traits
		let updates = {
			token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Dancing Light" : { "ActorId": actor.id } } }
			},
			"name": summonName
		}

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "uaUwyUt1T3zIRvDU";
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
			await warpgate.wait(1000);
			summonActor = game.actors.getName(summonName);
		}
		
		// ask how many lights to summon
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>How many lights do you want?</p>",
				buttons:
				{
					one: {
						label: `<p>1</p>`,
						callback: () => { resolve(1) }

					},
					two: {
						label: `<p>2</p>`,
						callback: () => { resolve(2) }

					},
					three: {
						label: `<p>3</p>`,
						callback: () => { resolve(3) }

					},
					four: {
						label: `<p>4</p>`,
						callback: () => { resolve(4) }

					},
					cancel: {
						label: `Cancel`,
						callback: () => { resolve(null) }
					}
				}
			}).render(true);
		});

		let count = await dialog;
		if (count) {
			// Spawn the dancing lights
			const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 120;
			let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
			if (position) {
				let options = {duplicates: count, collision: true};
				const spawned = await warpgate.spawnAt(position, summonName, {}, { controllingActor: actor }, options);
				if (!spawned || !spawned[0]) {
					ui.notifications.error(`${optionName} - unable to spawn the lights`);
					return false;
				}

				// keep track of the spawned lights, so that they can be deleted after the spell expires
				await actor.setFlag("midi-qol", summonFlag, summonName);
			}
			else {
				ui.notifications.error(`${optionName} - invalid summon location`);
				return false;
			}
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
