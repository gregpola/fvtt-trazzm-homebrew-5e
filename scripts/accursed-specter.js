/*
	Starting at 6th level, you can curse the soul of a person you slay, temporarily binding it to your service. When you slay a humanoid, you can cause its spirit to rise from its corpse as a specter, the statistics for which are in the Monster Manual. When the specter appears, it gains temporary hit points equal to half your warlock level. Roll initiative for the specter, which has its own turns. It obeys your verbal commands, and it gains a special bonus to its attack rolls equal to your Charisma modifier (minimum of +0).

	The specter remains in your service until the end of your next long rest, at which point it vanishes to the afterlife.

	Once you bind a specter with this feature, you can’t use the feature again until you finish a long rest.
*/
const version = "10.0.1";
const optionName = "Accursed Specter";
const creatureName = "Specter";
const specterFlag = "accursed-specter";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0] === "on") {
		// calculate the mods
		const levels = actor.classes?.warlock?.system.levels ?? 0;
		const tempHp = Math.ceil(levels / 2);
		const charMod = Math.max(0, actor.system.abilities.cha.mod);

		// summon the specter
		const summonName = creatureName + " (" + actor.name + ")";
		
		// update the attack bonus
        let updates = {
            token: {
                "name": summonName, 
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"texture.src": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Specter.webp",
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
            },
            actor: {
                "system": { 
					"attributes.hp.temp": tempHp,
					"bonuses" : {
						"msak.attack" : charMod,
						"mwak.attack" : charMod,
						"rsak.attack" : charMod,
						"rwak.attack" : charMod
					}
				}
            }
        }

        let summonActor = game.actors.getName(creatureName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "qnxud9vdRFrHwJlP";
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
		}		

        const result = await warpgate.spawn(creatureName, updates, {}, { controllingActor: actor });
		if (!result || !result[0]) {
			return ui.notifications.error(`${optionName} - Missing specter actor`);
		}		
	
		let specterToken = canvas.tokens.get(result[0]);
		if (specterToken) {
			await actor.setFlag("midi-qol", specterFlag, specterToken.id);
			// players can't do the following:
			//await specterToken.toggleCombat();
			//await specterToken.actor.rollInitiative();
		}
		
	}
	else if (args[0] === "off") {
		// delete the Specter
		const lastSpecter = actor.getFlag("midi-qol", specterFlag);
		if (lastSpecter) {
			await actor.unsetFlag("midi-qol",specterFlag);
			await warpgate.dismiss(lastSpecter, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
