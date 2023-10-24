/*
	A 5-foot-diameter Sphere of fire appears in an unoccupied space of your choice within range and lasts for the Duration.
	Any creature that ends its turn within 5 feet of the sphere must make a Dexterity saving throw. The creature takes
	2d6 fire damage on a failed save, or half as much damage on a successful one.

	As a Bonus Action, you can move the Sphere up to 30 feet. If you ram the sphere into a creature, that creature must
	make the saving throw against the sphere’s damage, and the sphere stops moving this turn.

	When you move the Sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet
	wide. The sphere ignites flammable Objects not being worn or carried, and it sheds bright light in a 20-foot radius
	and dim light for an additional 20 feet.

	At Higher Levels.When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d6 for each slot level above 2nd.
 */
const version = "11.0";
const optionName = "Flaming Sphere";
const summonFlag = "flaming-sphere";

try {
    if (args[0] === "on") {
		// Build the token updates
		let summonName = optionName + " (" + actor.name + ")";
		const spellLevel = lastArgValue.efData.flags["midi-qol"].castData.castLevel;
		
        const overTimeValue = `turn=end,saveDC=${actor.system.attributes.spelldc ?? 10},saveAbility=dex,damageRoll=${spellLevel}d6,damageType=fire,saveDamage=halfdamage,saveRemove=false`;
		
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
				"flags": { "midi-srd": { "Flaming Sphere": { "ActorId": actor.id } } }
            },
			"name": summonName,
			embedded: {
				Item: {
					"Flaming Sphere Damage": {
						"system.damage.parts": [[`${spellLevel}d6`, "fire"]], 
						"system.save.dc": actor.system.attributes.spelldc
					}
				},
				ActiveEffect: {
					"Flaming Sphere Proximity Damage": {
						"changes":  [{"key":"flags.midi-qol.OverTime", "mode":5, "value": overTimeValue, "priority":"20"}],
						"disabled": false,
						"label": "Flaming Sphere Damage",
						"icon": "icons/magic/fire/orb-vortex.webp",
						"origin": lastArgValue.origin,
						"flags": {
							"ActiveAuras": {
								"isAura":true,
								"aura":"All",
								"radius":5,
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
			const summonId = "kzn1NJxvNPHfNw0B";
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
			await summonedToken.toggleCombat();
			const objectInitiative = token.combatant.initiative ? token.combatant.initiative + .01
				: 1 + (summonedToken.actor.system.abilities.dex.value / 100);
			await summonedToken.combatant.update({initiative: objectInitiative});
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
			let auraEffect = tokenDoc.actor.effects?.find(i => i.label === "Flaming Sphere Proximity Damage" && i.origin === lastArgValue.origin);
			if (auraEffect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: uuid, effects: [auraEffect.id] });
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
