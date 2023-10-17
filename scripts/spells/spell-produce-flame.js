/*
	A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. The spell ends if you dismiss it as an action or if you cast it again.

	You can also attack with the flame, although doing so ends the spell. When you cast this spell, or as an action on a later turn, you can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 fire damage.

	This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).
*/
const version = "10.0.0";
const optionName = "Produce Flame";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) {
			ui.notifications.error("Please enable the Warp Gate module");
			return;
		}

		const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
		const cantripDice = 1 + Math.floor((characterLevel + 1) / 6);

		// add hurl flame item
		const updates = {
			embedded: {
				Item: {
					"Hurl Flame": {
						"type": "spell",
						"img": "icons/magic/fire/flame-burning-hand-orange.webp",
						"system": {
							"description": {
								"value": "You can also attack with the flame, although doing so ends the spell. When you cast this spell, or as an action on a later turn, you can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 fire damage."
							},
							"activation": {
								"type": "action",
								"cost": 1
							},
							"target": {
								"value": 1,
								"type": "creature"
							},
							"range": {
								"value":30,
								"long":null,
								"units": "ft"
							},
							"duration": {
								"value": null,
								"units": "inst"
							},
							"quantity": 1,
							"identified": true,
							"uses": {
								"value": 1,
								"max": "1",
								"per": "charges",
								"recovery": "",
								"autoDestroy": true,
								"autoUse": false
							},
							"actionType": "rsak",
							"attackBonus": "0",
							"equipped": true,
							"damage": {
								"parts": [[`${cantripDice}d8`,"fire"]],
								"versatile": ""
							},
							"level": 0,
							"school": "con",
							"components": {
								"value": "",
								"vocal": false,
								"somatic": true,
								"material": false,
								"ritual": false,
								"concentration": false
							},
							"materials": {
								"value": "",
								"consumed": false,
								"cost": 0,
								"supply": 0
							},
							"preparation": {
								"mode": "atwill",
								"prepared": false
							},
							"consume": {
							  "type": "",
							  "target": "",
							  "amount": null
							},
						},
						"effects": [
						{
						  "label": "Produce Flame Lighting",
						  "icon": "icons/magic/fire/flame-burning-hand-orange.webp",
						  "origin": `${lastArg.itemUuid}`,
						  "duration": {
							"startTime": null,
							"seconds": 600,
							"combat": null,
							"rounds": null,
							"turns": null,
							"startRound": null,
							"startTurn": null
						  },
						  "disabled": false,
						  "_id": "0RoX05O2NeM1sa2C",
						  "changes": [
							{
							  "key": "ATL.light.dim",
							  "mode": 2,
							  "value": "20",
							  "priority": 20
							},
							{
							  "key": "ATL.light.bright",
							  "mode": 2,
							  "value": "10",
							  "priority": 20
							},
							{
							  "key": "ATL.light.color",
							  "mode": 5,
							  "value": "#f98026",
							  "priority": 20
							},
							{
							  "key": "ATL.light.animation",
							  "mode": 5,
							  "value": "{\"type\": \"torch\",\"speed\": 1,\"intensity\": 1}",
							  "priority": 20
							},
							{
							  "key": "ATL.light.alpha",
							  "mode": 5,
							  "value": "0.33",
							  "priority": 20
							}
						  ],
						  "tint": null,
						  "transfer": true,
						  "flags": {
							"dfreds-convenient-effects": {
							  "description": "test"
							},
							"dae": {
							  "selfTarget": false,
							  "selfTargetAlways": false,
							  "stackable": "none",
							  "durationExpression": "",
							  "macroRepeat": "none",
							  "specialDuration": []
							},
							"core": {
							  "statusId": ""
							},
							"ActiveAuras": {
							  "isAura": false,
							  "aura": "None",
							  "radius": "undefined",
							  "alignment": "",
							  "type": "",
							  "ignoreSelf": false,
							  "height": false,
							  "hidden": false,
							  "displayTemp": false,
							  "hostile": false,
							  "onlyOnce": false
							},
						  }
						}
						],
						"flags": {
							"link-item-resource-5e": {
							  "resource-link": ""
							},
							"midi-qol": {
							  "fumbleThreshold": null,
							  "effectActivation": false,
							  "onUseMacroName": "[postActiveEffects]ItemMacro"
							},
							"midiProperties": {
							  "nodam": false,
							  "fulldam": false,
							  "halfdam": false,
							  "autoFailFriendly": false,
							  "autoSaveFriendly": false,
							  "rollOther": false,
							  "critOther": false,
							  "offHandWeapon": false,
							  "magicdam": false,
							  "magiceffect": false,
							  "concentration": false,
							  "toggleEffect": false,
							  "ignoreTotalCover": false
							},
							"itemacro": {
							  "macro": {
								"name": "Hurl Flame",
								"type": "script",
								"scope": "global",
								"command": "const lastArg = args[args.length - 1];\nconst actorToken = canvas.tokens.get(lastArg.tokenId);\nawait warpgate.revert(actorToken.document, \"Hurl Flame\");\n\nconst hasEffect = actorToken.actor.effects.find(eff=>eff.label === \"Produce Flame\");\nif (hasEffect) {\n\tawait MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: actorToken.actor.uuid, effects: [hasEffect.id] });\n}",
								"author": `${actor.uuid}`,
								"_id": null,
								"img": "icons/svg/dice-target.svg",
								"folder": null,
								"sort": 0,
								"ownership": {
								  "default": 0
								},
								"flags": {},
								"_stats": {
								  "systemId": null,
								  "systemVersion": null,
								  "coreVersion": null,
								  "createdTime": null,
								  "modifiedTime": null,
								  "lastModifiedBy": null
								}
							  }
							}
						},
					}
				}
			}
		};
		
		//update the token and create the feature
		await warpgate.mutate(actorToken.document, updates, {}, { name: "Hurl Flame" });
	}
	else if (args[0] === "off") {
		// revert mutations
        await warpgate.revert(actorToken.document, "Hurl Flame");
	}
		

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
