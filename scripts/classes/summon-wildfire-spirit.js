const version = "10.0.1";
const resourceName = "Wild Shape";
const optionName = "Summon Wildfire Spirit";
const cost = 1;
const creatureName = "Wildfire Spirit";
const summonFlag = "wildfire-spirit";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName} - resource found`);
			return false;
		}
		
		return await consumeResource(actor, resKey, cost);
		
	}
	else if (args[0].macroPass === "templatePlaced") {
		let templateData = lastArg.workflow.templateData;
		
		// summon the wildfire spirit
		const druidLevel = actor.classes.druid?.system.levels ?? 0;
		const pb = actor.system.attributes.prof;
		const actorDC = actor.system.attributes.spelldc ?? 12;
		
		// get position data
		const x = templateData.x;
		const y = templateData.y;

		const summonName = `${creatureName} (${actor.name})`;
		const hpValue = 5 + (5 * druidLevel);
        let updates = {
            token: {
                "name": summonName, 
				"img": lastArg.item.img,
				"disposition": 1,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Wildfire Spirit": { "ActorId": actor.id } } }
            },
            actor: {
                "name": summonName, 
                "system": { 
					"details.cr": druidLevel, 
					"attributes.hp": { value: hpValue, max: hpValue, formula: hpValue }
				}
            }
        }
		
        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "0AEkhbXs7xcVK9GQ";
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
			await warpgate.wait(1000);
			await document.update({ "name" : summonName });
		}		

        const result = await warpgate.spawnAt({ x, y }, summonName, updates, { controllingActor: actor });
		if (!result || !result[0]) {
			return ui.notifications.error(`${optionName} - Missing ${summonName} actor`);
		}		
	
		let spiritToken = canvas.tokens.get(result[0]);
		if (spiritToken) {
			await actor.setFlag("midi-qol", summonFlag, spiritToken.id);
			// players can't do the following:
			//await spiritToken.toggleCombat();
			//await spiritToken.actor.rollInitiative();
			
			// Update the spirit's actions
			let item = spiritToken.actor.items.getName("Fiery Teleportation");
			if (item) {
				let copy_item = foundry.utils.duplicate(item.toObject());
				copy_item.system.save.dc = actorDC;
				spiritToken.actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
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
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
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
