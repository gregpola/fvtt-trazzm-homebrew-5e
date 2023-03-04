/*
	You touch one to three pebbles and imbue them with magic. You or someone else can make a ranged spell attack with one of the pebbles by throwing it or hurling it with a sling. If thrown, it has a range of 60 feet. If someone else attacks with the pebble, that attacker adds your spellcasting ability modifier, not the attacker’s, to the attack roll. On a hit, the target takes bludgeoning damage equal to 1d6 + your spellcasting ability modifier. Hit or miss, the spell then ends on the stone.

	If you cast this spell again, the spell ends early on any pebbles still affected by it.
*/
const version = "10.0.0";
const optionName = "Magic Stone";

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
		const spellcastingAbility = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[spellcastingAbility].mod;

		// add stone items
		const updates = {
			embedded: {
				Item: {
					"Magical Stone": {
						"type": "spell",
						"img": "icons/commodities/stone/rock-gift.webp",
						"system": {
							"description": {
								"value": "<p>If thrown, it has a range of 60 feet. If someone else attacks with the pebble, that attacker adds your spellcasting ability modifier, not the attacker’s, to the attack roll. On a hit, the target takes bludgeoning damage equal to 1d6 + your spellcasting ability modifier. Hit or miss, the spell then ends on the stone.</p>"
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
								"value": 60,
								"long": null,
								"units": "ft"
							},
							"duration": {
								"value": null,
								"units": "inst"
							},
							"quantity": 1,
							"identified": true,
							"uses": {
								"value": 3,
								"max": "3",
								"per": "charges",
								"recovery": "",
								"autoDestroy": true,
								"autoUse": false
							},
							"actionType": "rsak",
							"ability": "",
							"attackBonus": "",
							"equipped": true,
							"damage": {
								"parts": [["1d6 + @mod","bludgeoning"]],
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
						"effects": [],
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
							  "magicdam": true,
							  "magiceffect": false,
							  "concentration": false,
							  "toggleEffect": false,
							  "ignoreTotalCover": false
							},
							"itemacro": {
							  "macro": {
								"name": "Magic Stones",
								"type": "script",
								"scope": "global",
							  "command": "const lastArg = args[args.length - 1];\nif (lastArg.itemData.system.uses.value === 0) {\nconst actorToken = canvas.tokens.get(lastArg.tokenId);\nawait warpgate.revert(actorToken.document, \"Magical Stone\");\n\nconst hasEffect = actorToken.actor.effects.find(eff=>eff.label === \"Magic Stone\");\nif (hasEffect) {\n\tawait MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: actorToken.actor.uuid, effects: [hasEffect.id] });\n}\n}",
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
		await warpgate.mutate(actorToken.document, updates, {}, { name: optionName });
	}
	else if (args[0] === "off") {
		// revert mutations
        await warpgate.revert(actorToken.document, optionName);
	}
		

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
