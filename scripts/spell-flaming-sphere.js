const version = "10.0.14";
const optionName = "Flaming Sphere";
const summonFlag = "flaming-sphere";
const creatureName = "Driftglobe";

try {
	const lastArg = args[args.length - 1];
	let caster;
	if (lastArg.tokenId) caster = canvas.tokens.get(lastArg.tokenId).actor;
	else caster = game.actors.get(lastArg.actorId);
	
    if (args[0] === "on") {

		// Build the token updates
		let summonName = optionName + " (" + caster.name + ")";
		const spellLevel = lastArg.efData.flags["midi-qol"].castData.castLevel;
		
        const overTimeValue = `turn=end,saveDC=${caster.system.attributes.spelldc ?? 10},saveAbility=dex,damageRoll=${spellLevel}d6,damageType=fire,saveDamage=halfdamage,saveRemove=false`;
		
        let updates = {
            token: {
                "name": summonName, 
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"lightColor": "#a2642a",
				"lightAlpha": 0.4,
				"lightAnimation": {
					"speed": 5,
					"intensity": 5,
					"type": "torch"
				},
				"flags": { "midi-srd": { "Flaming Sphere": { "ActorId": caster.id } } }
            },
			"name": summonName,
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
		        
		let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "4PyDMPHwGsfOY8mR";
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
			await warpgate.wait(1000);
		}

		// Spawn the result
		const options = { controllingActor: actor };
        const result = await warpgate.spawn(summonName, updates, {}, options);
		if (!result || !result[0]) {
			ui.notifications.error(`${optionName} - Unable to spawn`);
			return false;
		}

		let summonedToken = canvas.tokens.get(result[0]);
		if (summonedToken) {
			await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
			// players can't do the following:
			//await summonedToken.toggleCombat();
			//await summonedToken.actor.rollInitiative();
		}

    }
	else if (args[0] === "off") {
		// delete the sphere
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await actor.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
		
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
