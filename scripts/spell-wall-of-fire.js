const version = "10.0.0";
const optionName = "Wall of Fire";

try {
	if (args[0].tag === "OnUse") {
		const casterActor = fromUuidSync(args[0].tokenUuid).actor;
		let attackItem = game.items.getName("Wall of Fire attack");
		if (attackItem) {
			console.log(`${optionName} - found one attack item`);
		}
		
		if (!attackItem) {
			const itemJSON = JSON.parse(`{
				"name": "Wall of Fire attack",
				"type": "spell",
				"img": "icons/magic/fire/projectile-wave-yellow.webp",
				"system": {
					"description": {
						"value": "",
						"chat": "",
						"unidentified": ""
					},
					"source": "",
					"quantity": 1,
					"weight": 0,
					"price": 0,
					"attunement": 0,
					"equipped": true,
					"rarity": "",
					"identified": true,
					"activation": {
						"type": "special",
						"cost": 0,
						"condition": ""
					},
					"duration": {
						"value": null,
						"units": "inst"
					},
					"target": {
						"value": 1,
						"width": null,
						"units": "",
						"type": "creature"
					},
					"range": {
						"value": 240,
						"long": null,
						"units": "ft"
					},
					"uses": {
						"value": null,
						"max": "",
						"per": "",
						"recovery": ""
					},
					"consume": {
						"type": "",
						"target": "",
						"amount": null
					},
					"ability": "",
					"actionType": "save",
					"attackBonus": 0,
					"chatFlavor": "",
					"critical": {
						"threshold": null,
						"damage": ""
					},
					"damage": {
						"parts": [
							["5d8", "fire"]
						],
						"versatile": ""
					},
					"formula": "",
					"save": {
						"ability": "dex",
						"dc": null,
						"scaling": "spell"
					},
					"level": 0,
					"school": "con",
					"components": {
						"value": "",
						"vocal": true,
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
						"mode": "prepared",
						"prepared": true
					}
				},
				"effects": [],
				"flags": {
					"midi-qol": {
						"effectActivation": false
					},
					"midiProperties": {
						"nodam": false,
						"fulldam": false,
						"halfdam": false,
						"rollOther": false,
						"critOther": false,
						"magicdam": false,
						"magiceffect": false,
						"concentration": false,
						"toggleEffect": false,
						"ignoreTotalCover": false
					},
					"exportSource": {
					"world": "test-5e",
					"system": "dnd5e",
					"coreVersion": "10.290",
					"systemVersion": "2.1.2"
					}
				},
				"_stats": {
					"systemId": "dnd5e",
					"systemVersion": "2.1.2",
					"coreVersion": "10.290",
					"createdTime": 1669083115688,
					"modifiedTime": 1669086825953,
					"lastModifiedBy": "oKTPW6AHSqX8CsNe"
				}
				}`);
			await Item.create(itemJSON);
		}
		
		attackItem = game.items.getName("Wall of Fire attack");
		if (!attackItem) {
			console.log(`${optionName} No attack item`);
			ui.notifications.warn(`${optionName} no attack item found`);
			return;
		}
		else {
			const spell = casterActor.items.getName(optionName);
			let spellEffect = spell.effects.find(eff=>eff.label === optionName).toObject();
			if (spellEffect.changes[0].value !== attackItem.uuid) {
				spellEffect.changes[0].value = `Item.${attackItem.id}`;
				await spell.update({effects:[spellEffect]});
			}
		}
	}
		
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
