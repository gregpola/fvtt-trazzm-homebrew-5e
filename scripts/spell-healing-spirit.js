const version = "10.0.0";
const optionName = "Healing Spirit";

try {
	const lastArg = args[args.length - 1];
	let caster;
	if (lastArg.tokenId) caster = canvas.tokens.get(lastArg.tokenId).actor;
	else caster = game.actors.get(lastArg.actorId);
	
    if (args[0] === "on") {
        let summonActor = game.actors.getName(optionName);
        if (!summonActor) {
			ui.notifications.error(`${optionName} - Healing Spirit actor not found!`);
            return;
        }
		
		const summonName = optionName + " (" + caster.name + ")";
		const spellLevel = lastArg.efData.flags["midi-qol"].castData.castLevel;
		const ability = caster.system.attributes.spellcasting;
		const abilityBonus = caster.system.abilities[ability].mod;
		const uses = Math.max(abilityBonus + 1, 2);
		const healDice = spellLevel - 1;

        let updates = {
            token: {
                "name": summonName, 
				"disposition": 1,
				"flags": { "midi-srd": { "Healing Spirit": { "ActorId": caster.id } } }
            },
			embedded: {
				Item: {
					"Healing": {
						"system.uses.value": uses,
						"system.uses.max": uses,
						"system.damage.parts": [[`${healDice}d6`, "healing"]]
					}
				}
            },
        };

		const options = { controllingActor: caster };

        const summoned = await warpgate.spawn(optionName, updates, {}, options);
        if (summoned.length !== 1) {
			return ui.notifications.error(`${optionName} - Unable to spawn the spirit`);
		}		
		
		//const summonedSpirit = canvas.scene.tokens.get(summoned[0]);		
		// Save the sphere id on the caster
		await actor.setFlag("midi-qol", "healing-spirit", summoned[0]);

	}
	else if (args[0] === "off") {
		// delete the spirit
		const lastSphere = caster.getFlag("midi-qol", "healing-spirit");
		if (lastSphere) await caster.unsetFlag("midi-qol", "healing-spirit");
        await MidiMacros.deleteTokens(optionName, caster);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
