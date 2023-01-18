const version = "10.0.0";
const optionName = "Moonbeam";

try {
	const lastArg = args[args.length - 1];
	let caster;
	if (lastArg.tokenId) caster = canvas.tokens.get(lastArg.tokenId).actor;
	else caster = game.actors.get(lastArg.actorId);
	
    if (args[0] === "on") {
		let summonName = optionName + " (" + caster.name + ")";
        let sphereActor = game.actors.getName(optionName);
        if (!sphereActor) {
			ui.notifications.error(`${optionName} - actor not found!`);
            return;
        }
		
		const spellLevel = lastArg.efData.flags["midi-qol"].castData.castLevel;
		// attributes.spelldc
				
        const overTimeValue = `turn=start,saveDC=${caster.system.attributes.spelldc ?? 10},saveAbility=con,damageRoll=${spellLevel}d10,damageType=radiant,saveDamage=halfdamage,saveRemove=false`;

        let updates = {
            token: {
                "name": summonName, 
				"disposition": 1,
				"lightColor": "#7c8fb1",
				"lightAlpha": 0.5,
				"flags": { "midi-srd": { "Moonbeam": { "ActorId": caster.id } } }
            },
			embedded: {
				Item: {
					"Entry Damage": {
						"system.damage.parts": [[`${spellLevel}d10`, "radiant"]], 
						"system.save.dc": caster.system.attributes.spelldc
					}
				},
				ActiveEffect: {
					"Moonbeam Aura": {
						"changes":  [{"key":"flags.midi-qol.OverTime", "mode":5, "value": overTimeValue, "priority":"20"}],
						"disabled": false,
						"label": "Moonbeam Damage",
						"icon": "icons/magic/light/beam-rays-blue-large.webp",
						"origin": lastArg.origin,
						"flags": {
							"ActiveAuras": {
								"isAura":true,
								"aura":"All",
								"radius":7.5,
								"alignment":"",
								"type":"",
								"ignoreSelf":true,
								"height":false,
								"hidden":false,
								"hostile":false,
								"onlyOnce":false
							}
						},
					}
				}
            }
        };
		let options = { controllingActor: caster };

        const summoned = await warpgate.spawn("Moonbeam", updates, {}, options);
        if (summoned.length !== 1) {
			return ui.notifications.error(`${optionName} - Unable to spawn the Moonbeam`);
		}
				
		// Save the sphere id on the caster
		await actor.setFlag("midi-qol", "moonbeam-actor", summoned[0]);

    }
	else if (args[0] === "off") {
		// delete the sphere
		const lastSphere = caster.getFlag("midi-qol", "moonbeam-actor");
		if (lastSphere) await caster.unsetFlag("midi-qol", "moonbeam-actor");
        await MidiMacros.deleteTokens("Moonbeam", caster);
		
		// delete all overTime effects
		for (let tokenDoc of canvas.scene.tokens) {
			let uuid = tokenDoc.actor.uuid;
			let auraEffect = tokenDoc.actor.effects?.find(i => i.label === "Moonbeam Aura" && i.origin === lastArg.origin);
			if (auraEffect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: uuid, effects: [auraEffect.id] });
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
