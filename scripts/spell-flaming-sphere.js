const version = "10.0.13";
const optionName = "Flaming Sphere";

try {
	const lastArg = args[args.length - 1];
	let caster;
	if (lastArg.tokenId) caster = canvas.tokens.get(lastArg.tokenId).actor;
	else caster = game.actors.get(lastArg.actorId);
	
    if (args[0] === "on") {
		let summonName = optionName + " (" + caster.name + ")";
        let sphereActor = game.actors.getName(optionName);
        if (!sphereActor) {
			ui.notifications.error(`${optionName} - Flaming Sphere actor not found!`);
            return;
        }
		
		const spellLevel = lastArg.efData.flags["midi-qol"].castData.castLevel;
		
        const overTimeValue = `turn=end,saveDC=${caster.system.attributes.spelldc ?? 10},saveAbility=dex,damageRoll=${spellLevel}d6,damageType=fire,saveDamage=halfdamage,saveRemove=false`;
		
        let updates = {
            token: {
                "name": summonName, 
				"disposition": 1,
				"lightColor": "#a2642a",
				"lightAlpha": 0.4,
				"lightAnimation": {
					"speed": 5,
					"intensity": 5,
					"type": "torch"
				},
				"flags": { "midi-srd": { "Flaming Sphere": { "ActorId": caster.id } } }
            },
			embedded: {
				Item: {
					"Flaming Sphere Damage": {
						"system.damage.parts": [[`${spellLevel}d6`, "fire"]], 
						"system.save.dc": caster.system.attributes.spelldc
					}
				},
				ActiveEffect: {
					"Flaming Sphere Proximity Damage": {
						"changes":  [{"key":"flags.midi-qol.OverTime", "mode":5, "value": overTimeValue, "priority":"20"}],
						"disabled": false,
						"label": "Flaming Sphere Damage",
						"icon": "icons/magic/fire/orb-vortex.webp",
						"origin": lastArg.origin,
						"flags": {
							"ActiveAuras": {
								"isAura":true,
								"aura":"All",
								"radius":7.5,
								"alignment":"",
								"type":"",
								"ignoreSelf":true,
								"height":true,
								"hidden":false,
								"hostile":false,
								"onlyOnce":false
							}
						},
					}
				}
            },
        };
		let options = { controllingActor: caster };

        const summoned = await warpgate.spawn("Flaming Sphere", updates, {}, options);
        if (summoned.length !== 1) {
			return ui.notifications.error(`${optionName} - Unable to spawn the sphere`);
		}
		
		const summonedSphere = canvas.scene.tokens.get(summoned[0]);
				
		// Save the sphere id on the caster
		await actor.setFlag("midi-qol", "flaming-sphere", summoned[0]);

    }
	else if (args[0] === "off") {
		// delete the sphere
		const lastSphere = caster.getFlag("midi-qol", "flaming-sphere");
		if (lastSphere) await caster.unsetFlag("midi-qol", "flaming-sphere");
        await MidiMacros.deleteTokens("Flaming Sphere", caster);
		
		// delete all overTime effects
		for (let tokenDoc of canvas.scene.tokens) {
			let uuid = tokenDoc.actor.uuid;
			let auraEffect = tokenDoc.actor.effects?.find(i => i.label === "Flaming Sphere Proximity Damage" && i.origin === lastArg.origin);
			if (auraEffect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: uuid, effects: [auraEffect.id] });
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
