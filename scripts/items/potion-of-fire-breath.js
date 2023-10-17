/*
	After drinking this potion, you can use a bonus action to exhale fire at a target within 30 feet of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.

	This potion's orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.
*/
const version = "10.0.0";
const optionName = "Potion of Fire Breath";
const breathAttackName = "Fire Breath Attack";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].tag === "OnUse") {
		// if the item doesn't already exists, create it
		let attackItem = game.items.getName(breathAttackName);
		if (!attackItem) {
			const itemJSON = JSON.parse(`{
				"name": "Fire Breath Attack",
				"type": "consumable",
				"img": "icons/creatures/abilities/dragon-fire-breath-orange.webp",
				"system": {
					"description": {
						"value": "<p>You can use a bonus action to exhale fire at a target within 30 feet of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.</p>",
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
						"type": "bonus",
						"cost": 1,
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
						"value": 30,
						"long": null,
						"units": "ft"
					},
					"uses": {
					  "value": 3,
					  "max": "3",
					  "per": "charges",
					  "autoDestroy": true,
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
							"4d6",
							"fire"
							]
						],
						"versatile": ""
					},
					"formula": "",
					"save": {
						"ability": "dex",
						"dc": 13,
						"scaling": "flat"
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
						"world": "",
						"system": "dnd5e",
						"coreVersion": "10.290",
						"systemVersion": "2.1.4"
					},
					"autoanimations": {
					  "id": "85019f5b-a85e-4eb9-851c-4aa21274a3cf",
					  "label": "Fire Breath Attack",
					  "levels3d": {
						"type": "explosion",
						"data": {
						  "color01": "#FFFFFF",
						  "color02": "#FFFFFF",
						  "spritePath": "modules/levels-3d-preview/assets/particles/dust.png"
						},
						"sound": {
						  "enable": false
						},
						"secondary": {
						  "enable": false,
						  "data": {
							"color01": "#FFFFFF",
							"color02": "#FFFFFF",
							"spritePath": "modules/levels-3d-preview/assets/particles/dust.png"
						  }
						}
					  },
					  "macro": {
						"enable": false,
						"playWhen": "0"
					  },
					  "menu": "range",
					  "primary": {
						"video": {
						  "dbSection": "range",
						  "menuType": "spell",
						  "animation": "guidingbolt",
						  "variant": "02",
						  "color": "red",
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
						  "contrast": 0,
						  "delay": 0,
						  "elevation": 1000,
						  "isReturning": false,
						  "isWait": false,
						  "onlyX": false,
						  "opacity": 1,
						  "playbackRate": 1,
						  "repeat": 1,
						  "repeatDelay": 250,
						  "saturate": 0,
						  "tint": false,
						  "tintColor": "#FFFFFF",
						  "zIndex": 1
						}
					  },
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
						  "contrast": 0,
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
						  "saturate": 0,
						  "size": 1.5,
						  "tint": false,
						  "tintColor": "#FFFFFF",
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
						  "contrast": 0,
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
						  "saturate": 0,
						  "size": 1,
						  "tint": false,
						  "tintColor": "#FFFFFF",
						  "zIndex": 1
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
						  "contrast": 0,
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
						  "saturate": 0,
						  "size": 1,
						  "tint": false,
						  "tintColor": "#FFFFFF",
						  "unbindAlpha": false,
						  "unbindVisibility": false,
						  "zIndex": 1
						}
					  },
					  "isEnabled": true,
					  "isCustomized": true,
					  "fromAmmo": false,
					  "version": 5
					}
				},
				"_stats": {
					"systemId": "dnd5e",
					"systemVersion": "2.1.4",
					"coreVersion": "10.290",
					"createdTime": 1669083115688,
					"modifiedTime": 1669086825953,
					"lastModifiedBy": "oKTPW6AHSqX8CsNe"
				}
			}`);
			await Item.create(itemJSON);
		}
		attackItem = game.items.getName(breathAttackName)
		if (!attackItem) {
			console.log(`${optionName} - unable to create the attack item`)
			ui.notifications.error(`${optionName} - unable to create the attack item`)
			return;
		}
		else {
			const potion = actor.items.getName(optionName);
			if (potion) {
				let macroEffect = potion.effects.find(eff=>eff.label === optionName).toObject()
				if (macroEffect.changes[0].value !== attackItem.uuid) {
					macroEffect.changes[0].value = `Item.${attackItem.id}`
					await potion.update({effects:[macroEffect]})
				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName} v${version}`, err);
}
