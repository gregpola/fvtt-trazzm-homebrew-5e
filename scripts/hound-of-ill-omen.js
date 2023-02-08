const version = "10.0.0";
const resourceName = "Sorcery Points";
const optionName = "Hound of Ill Omen";
const cost = 3;
const summonFlag = "hound-of-ill-omen";
const creatureName = "Hound of Ill Omen";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0] === "on") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${optionName}: ${resourceName} - no resource found`);
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${optionName}: ${resourceName} - resource pool is empty`);
		}
		
		if (points < cost) {
			return ui.notifications.error(`${optionName}: ${resourceName} - not enough points (need ${cost})`);
		}

		// summon the hound
		const summonName = `${creatureName} (${actor.name})`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Hound of Ill Omen" : { "ActorId": actor.id } } }
			}
		}
		
        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "mQjQtV8KIUCJVzTA";
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
		
		const options = { controllingActor: actor };
		const result = await warpgate.spawn(summonName,  updates, {}, options);
		if (result.length !== 1) {
			return;
		}

		let houndToken = canvas.tokens.get(result[0]);
		if (houndToken) {
			await actor.setFlag("midi-qol", summonFlag, houndToken.id);
			// players can't do the following:
			//await spiritToken.toggleCombat();
			//await spiritToken.actor.rollInitiative();

			// add the temp HP
			const levels = actor.classes.sorcerer.system.levels ?? 0;
			const tempHp = Math.floor(levels / 2);
			houndToken.document.actor.update({system:{attributes:{hp:{temp: tempHp}}}});
		}

		await consumeResource(actor, resKey, cost);		
	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await actor.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
