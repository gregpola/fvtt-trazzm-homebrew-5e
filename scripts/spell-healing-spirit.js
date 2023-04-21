/*
	You call forth a nature spirit to soothe the wounded. The intangible spirit appears in a space that is a 5-foot cube you can see within range. The spirit looks like a transparent beast or fey (your choice).

	Until the spell ends, whenever you or a creature you can see moves into the spirit’s space for the first time on a turn or starts its turn there, you can cause the spirit to restore 1d6 hit points to that creature (no action required). The spirit can’t heal constructs or undead. The spirit can heal a number of times equal to 1 + your spellcasting ability modifier (minimum of twice). After healing that number of times, the spirit disappears.

	As a bonus action on your turn, you can move the spirit up to 30 feet to a space you can see.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the healing increases by 1d6 for each slot level above 2nd.
*/
const version = "10.0.2";
const optionName = "Healing Spirit";
const actorName = "Healing Spirit";
const summonFlag = "healing-spirit";

try {
	const lastArg = args[args.length - 1];
	let caster = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
    if (args[0] === "on") {
		const sourceItem = await fromUuid(lastArg.origin);
		let summonName = optionName + " (" + caster.name + ")";
		//const spellLevel = Number(args[1]);
		const spellLevel = lastArg.efData.flags["midi-qol"].castData.castLevel;
		const ability = caster.system.attributes.spellcasting;
		const abilityBonus = caster.system.abilities[ability].mod;
		const uses = Math.max(abilityBonus + 1, 2);
		const healDice = spellLevel - 1;
		let healingBonus = 0;

		let featureItem = caster.items.getName("Disciple of Life");
		if (featureItem) {
			healingBonus = 2 + spellLevel;
		}		

        let updates = {
            token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Healing Spirit": { "ActorId": caster.id } } }
            },
			"name": summonName,
			embedded: {
				Item: {
					"Healing": {
						"system.uses.value": uses,
						"system.uses.max": uses,
						"system.damage.parts": [[`${healDice}d6 + ${healingBonus}`, "healing"]]
					}
				}
            },
        };
		
        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "T5eonwFExxiqgS55";
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

		// spawn the actor
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 60;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't summon on top of another token`);
				return false;
			}

			const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: caster }, {});
			if (!result || !result[0]) {
				ui.notifications.error(`${optionName} - Unable to spawn`);
				return false;
			}

			let summonedToken = canvas.tokens.get(result[0]);
			if (summonedToken) {
				await caster.setFlag("midi-qol", summonFlag, summonedToken.id);
				// players can't do the following:
				//await summonedToken.toggleCombat();
				//await summonedToken.actor.rollInitiative();
			}
			
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return false;
		}

	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = caster.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await caster.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
