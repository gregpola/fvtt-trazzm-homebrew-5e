const version = "10.0.2";
const optionName = "Spiritual Weapon";
const actorName = "Spiritual Weapon";
const summonFlag = "spiritual-weapon";

try {
	const lastArg = args[args.length - 1];
	const caster = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const sourceItem = await fromUuid(lastArg.origin);
		const spellLevel = Number(args[1]);
		const attackDice = 1 + Math.floor((spellLevel-2)/2);

		let spellStat = caster.system.attributes.spellcasting;
		if (spellStat === "") spellStat = "wis";
		const spellMod = caster.system.abilities[spellStat].mod;
		const pb = caster.system.attributes.prof;
		const msakBonus = caster.system.bonuses.msak.attack ? Number(caster.system.bonuses.msak.attack) : 0;
		const toHitBonus = spellMod + pb + msakBonus;

		const summonName = `${actorName} (${caster.name})`;
		const updates = {
            token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Spiritual Weapon": { "ActorId": caster.id } } }
			},
			"name": summonName,	
			embedded: {
				Item: {
					"Spiritual Weapon Attack": {
						"system.proficient": false,
						"system.properties.mgc": true,
						"system.attackBonus": `${toHitBonus}`,
						"system.damage.parts":[[`${attackDice}d8 + ${spellMod}`,"force"]]
					}
				}
			}
		};

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "hs0ZBBlEPoBr10LZ";
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
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}
		
		// Spawn the result
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 60;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
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
				await anime(actorToken, summonedToken);
				await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
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
        .file("jb2a.misty_step.02.blue")       
        .atLocation(target)
		.scaleToObject(1)
		.play();
}