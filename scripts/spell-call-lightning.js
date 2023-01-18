// From thatLonelyBugber
const version = "10.0.0";
const optionName = "Call Lightning";

try {
	if (args[0].tag === "OnUse") {
		const casterActor = fromUuidSync(args[0].tokenUuid).actor;
		let attackItem = game.items.getName("Call Lightning attack")
		if (attackItem) {
			console.log("Found one attack item")
		}
		if (!attackItem) {
			const itemJSON = JSON.parse(`{
				"name": "Call Lightning attack",
				"type": "spell",
				"img": "icons/magic/lightning/bolt-blue.webp",
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
						"type": "action",
						"cost": 1,
						"condition": ""
					},
					"duration": {
						"value": null,
						"units": "inst"
					},
					"target": {
						"value": 5,
						"width": null,
						"units": "ft",
						"type": "cylinder"
					},
					"range": {
						"value": 60,
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
							[
							"3d10",
							"lightning"
							]
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
					"autoanimations": {
						"id": "41d5ef17-8133-410a-9722-7a2a50dbd115",
						"label": "Call Lightning attack",
						"macro": {
							"enable": false,
							"playWhen": "0"
						},
						"menu": "templatefx",
						"secondary": {
							"enable": false,
							"video": {
								"dbSection": "static",
								"menuType": "spell",
								"animation": "curewounds",
								"variant": "01",
								"color": "blue",
								"enableCustom": false,
								"customPath": ""
							},
							"sound": {
								"enable": false,
								"delay": 0,
								"repeat": 1,
								"repeatDelay": 250,
								"startTime": 0,
								"volume": 0.75
							},
							"options": {
								"addTokenWidth": false,
								"anchor": "0.5",
								"delay": 0,
								"elevation": 1000,
								"fadeIn": 250,
								"fadeOut": 500,
								"isMasked": false,
								"isRadius": true,
								"isWait": false,
								"opacity": 1,
								"repeat": 1,
								"repeatDelay": 250,
								"size": 1.5,
								"zIndex": 1
							}
						},
						"soundOnly": {
							"sound": {
								"enable": false,
								"delay": 0,
								"repeat": 1,
								"repeatDelay": 250,
								"startTime": 0,
								"volume": 0.75
							}
						},
						"target": {
							"enable": false,
							"video": {
								"dbSection": "static",
								"menuType": "spell",
								"animation": "curewounds",
								"variant": "01",
								"color": "blue",
								"enableCustom": false,
								"customPath": ""
							},
							"sound": {
								"enable": false,
								"delay": 0,
								"repeat": 1,
								"repeatDelay": 250,
								"startTime": 0,
								"volume": 0.75
							},
							"options": {
								"addTokenWidth": false,
								"anchor": "0.5",
								"delay": 0,
								"elevation": 1000,
								"fadeIn": 250,
								"fadeOut": 500,
								"isMasked": false,
								"isRadius": false,
								"opacity": 1,
								"persistent": false,
								"repeat": 1,
								"repeatDelay": 250,
								"size": 1,
								"unbindAlpha": false,
								"unbindVisibility": false,
								"zIndex": 1
							}
						},
						"isEnabled": true,
						"isCustomized": true,
						"fromAmmo": false,
						"version": 5,
						"primary": {
							"video": {
								"dbSection": "templatefx",
								"menuType": "circle",
								"animation": "explosion",
								"variant": "01",
								"color": "blue",
								"enableCustom": false,
								"customPath": ""
							},
							"sound": {
								"enable": false,
								"delay": 0,
								"repeat": 1,
								"repeatDelay": 250,
								"startTime": 0,
								"volume": 0.75
							},
							"options": {
								"delay": 0,
								"elevation": 1000,
								"isMasked": false,
								"isWait": false,
								"occlusionAlpha": 0.5,
								"occlusionMode": "3",
								"opacity": 1,
								"persistent": false,
								"persistType": "sequencerground",
								"playbackRate": 1,
								"removeTemplate": true,
								"repeat": 1,
								"repeatDelay": 250,
								"rotate": 0,
								"scale": "1",
								"zIndex": 1
							}
						},
						"source": {
							"enable": false,
							"video": {
								"dbSection": "static",
								"menuType": "spell",
								"animation": "curewounds",
								"variant": "01",
								"color": "blue",
								"enableCustom": false,
								"customPath": ""
							},
							"sound": {
								"enable": false,
								"delay": 0,
								"repeat": 1,
								"repeatDelay": 250,
								"startTime": 0,
								"volume": 0.75
							},
							"options": {
								"addTokenWidth": false,
								"anchor": "0.5",
								"delay": 0,
								"elevation": 1000,
								"fadeIn": 250,
								"fadeOut": 500,
								"isMasked": false,
								"isRadius": false,
								"isWait": true,
								"opacity": 1,
								"repeat": 1,
								"repeatDelay": 250,
								"size": 1,
								"zIndex": 1
							}
						}
					},
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
					"world": "fr-myths-and-shadows",
					"system": "dnd5e",
					"coreVersion": "10.290",
					"systemVersion": "2.0.3"
					}
				},
				"_stats": {
					"systemId": "dnd5e",
					"systemVersion": "2.0.3",
					"coreVersion": "10.290",
					"createdTime": 1669083115688,
					"modifiedTime": 1669086825953,
					"lastModifiedBy": "oKTPW6AHSqX8CsNe"
				}
				}`)
			await Item.create(itemJSON)
		}
		attackItem = game.items.getName("Call Lightning attack")
		if (!attackItem) {
			console.log("No attack item")
			ui.notifications.warn("No Call Lightning attack item found")
			return;
		}
		else {
			const spell = casterActor.items.getName("Call Lightning");
			let spellEffect = spell.effects.find(eff=>eff.label === "Call Lightning").toObject()
			if (spellEffect.changes[0].value !== attackItem.uuid) {
				spellEffect.changes[0].value = `Item.${attackItem.id}`
				await spell.update({effects:[spellEffect]})
			}
		}
	}
		
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
