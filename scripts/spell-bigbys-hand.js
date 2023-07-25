/*
	You create a Large hand of shimmering, translucent force in an unoccupied space that you can see within range. The hand lasts for the spell's duration, and it moves at your command, mimicking the movements of your own hand.

	The hand is an object that has AC 20 and hit points equal to your hit point maximum. If it drops to 0 hit points, the spell ends. It has a Strength of 26 (+8) and a Dexterity of 10 (+0). The hand doesn't fill its space.

	When you cast the spell and as a bonus action on your subsequent turns, you can move the hand up to 60 feet and then cause one of the following effects with it.
*/
const version = "10.3";
const optionName = "Bigby's Hand";
const summonFlag = "bigbys-hand";
const summonId = "VGPZe2To1voHuhys";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const sourceItem = await fromUuid(lastArg.origin);
		const spellLevel = Number(args[1]);
		const clenchedDice = 4 + ((spellLevel - 5) * 2);
		const graspingDice = 2 + ((spellLevel - 5) * 2);

		let spellStat = actor.system.attributes.spellcasting;
		if (spellStat === "") spellStat = "int";
		const spellMod = actor.system.abilities[spellStat].mod;
		const pb = actor.system.attributes.prof;
		const msakBonus = actor.system.bonuses.msak.attack ? Number(actor.system.bonuses.msak.attack) : 0;
		const toHitBonus = spellMod + pb + msakBonus;

		const summonName = `${optionName} (${actor.name})`;
		const updates = {
            token: {
				"name": summonName,
				"disposition": actorToken.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"actorLink": false,
				"flags": { "midi-srd": { "Bigby's Hand": { "ActorId": actor.id } } }
			},
			"name": summonName,	
			embedded: {
				Item: {
					"Clenched Fist": {
						"system.proficient": false,
						"system.properties.mgc": true,
						"system.attackBonus": `${toHitBonus}`,
						"system.damage.parts":[[`${clenchedDice}d8`,"force"]]
					},
					"Crush Grappled": {
						"system.damage.parts":[[`${graspingDice}d6`,"bludgeoning"]]
					}
				}
			}
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
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 120;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(summonActor, newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't summon on top of another token`);
				return false;
			}

			const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, {});
			if (!result || !result[0]) {
				ui.notifications.error(`${optionName} - unable to summon`);
				return false;
			}

			let summonedToken = canvas.tokens.get(result[0]);
			if (summonedToken) {
				await anime(actorToken, summonedToken);
				await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
				await summonedToken.actor.setFlag("midi-qol", summonFlag, spellMod);
			}
			
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return false;
		}
	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await actor.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.explosion.01.blue")       
        .atLocation(target)
		.center()
		.scaleToObject(2.0)
		.belowTokens()
		.play();
}