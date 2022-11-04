const version = "0.1.0";
const resourceName = "Wild Shape";
const optionName = "Summon Wildfire Spirit";
const cost = 1;
const flagName = "Wildfire Spirit Position";

try {

	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - resource found`);
			return false;
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName} - No wild shape uses left`);
			return false;
		}
		
		await consumeResource(actor, resKey, cost);
		
	}
	else if (args[0].macroPass === "templatePlaced") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let templateData = workflow.templateData;
		
		// summon the wildfire spirit
		const druidLevel = actor.classes?.druid?.data?.data?.levels ?? 0;
		const pb = actor.data.data.attributes.prof;
		const actorDC = actor.data.data.attributes.spelldc ?? 12;
		
		// get position data
		const x = templateData.x;
		const y = templateData.y;

        let updates = {
            token: {
                "name": "Wildfire Spirit", 
				"img": workflow.item.data.img,
				"flags": { "midi-srd": { "Wildfire Spirit": { "ActorId": actor.id } } }
            },
            actor: {
                "name": "Wildfire Spirit",
                "data.attributes": { 
					"prof": pb, 
					"hp.value": 5 + (5 * druidLevel),
					"hp.max": 5 + (5 * druidLevel)
				}
            }
        }
		
		//const result = await warpgate.spawn("Wildfire Spirit",  updates, {}, {controllingActor: actor});
        const result = await warpgate.spawnAt({ x, y }, "Wildfire Spirit", updates, { controllingActor: actor });
		if (!result || !result[0]) {
			return ui.notifications.error(`${resourceName} - Missing actor`);
		}
		
		let spiritToken = canvas.tokens.get(result[0]);
		if (spiritToken) {
			await spiritToken.toggleCombat();
			
			// set initiative
			const actorInit = canvas.tokens.get(args[0].tokenId)?.combatant?.data?.initiative ?? 2;
			await spiritToken.combatant?.rollInitiative(`${actorInit - 1}`);
			
			// Update the spirit's actions
			let item = spiritToken.actor.items.getName("Fiery Teleportation");
			if (item) {
				let copy_item = duplicate(item.toObject());
				copy_item.data.save.dc = actorDC;
				spiritToken.actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
		}
		
		// enable enhanced bond
		let enhancedBond = actor.items.getName("Enhanced Bond");
		if (enhancedBond) {
			await enhancedBond.roll();
		}
		
	}
	else if (args[0] === "off") {
		const lastArg = args[args.length - 1];
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
        await MidiMacros.deleteTokens("Wildfire Spirit", actor);
		
		// disable enhanced bond
		let effect = await findEffect(actor, "Enhanced Bond");
		if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}
