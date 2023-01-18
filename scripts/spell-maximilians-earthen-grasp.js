const version = "10.0.0";
const optionName = "Maximilian's Earthen Grasp";
const actorName = "Maximilian's Hand";

try {
	const lastArg = args[args.length - 1];
	let caster;
	if (lastArg.tokenId) caster = canvas.tokens.get(lastArg.tokenId).actor;
	else caster = game.actors.get(lastArg.actorId);
	
    if (args[0] === "on") {
        let summonActor = game.actors.getName(actorName);
        if (!summonActor) {
			ui.notifications.error(`${optionName} - ${actorName} actor not found!`);
            return;
        }
		
		const summonName = actorName + " (" + caster.name + ")";

        let updates = {
            token: {
                "name": summonName, 
				"disposition": 1,
				"flags": { "midi-srd": { "Maximilian's Hand": { "ActorId": caster.id } } }
            },
			embedded: {
				Item: {
					"Grasp": {
						"system.save.dc": caster.system.attributes.spelldc
					},
					"Crush": {
						"system.save.dc": caster.system.attributes.spelldc
					}
				}
            },
        };

		const options = { controllingActor: caster };

        const summoned = await warpgate.spawn(actorName, updates, {}, options);
        if (summoned.length !== 1) {
			return ui.notifications.error(`${optionName} - Unable to spawn the hand`);
		}		
		
		// Save the hand id on the caster
		await actor.setFlag("midi-qol", "maximilians-hand", summoned[0]);

	}
	else if (args[0] === "off") {
		// delete the hand
		const lastSphere = caster.getFlag("midi-qol", "maximilians-hand");
		if (lastSphere) await caster.unsetFlag("midi-qol", "maximilians-hand");
        await MidiMacros.deleteTokens(actorName, caster);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
