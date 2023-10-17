/*
	When you enter your rage, you can transform, revealing the bestial power within you. Until the rage ends, you manifest a natural weapon. It counts as a simple melee weapon for you, and you add your Strength modifier to the attack and damage rolls when you attack with it, as normal.

	You choose the weapon’s form each time you rage:

	Bite. Your mouth transforms into a bestial muzzle or great mandibles (your choice). It deals 1d8 piercing damage on a hit. Once on each of your turns when you damage a creature with this bite, you regain a number of hit points equal to your proficiency bonus, provided you have less than half your hit points when you hit.

	Claws. Each of your hands transforms into a claw, which you can use as a weapon if it’s empty. It deals 1d6 slashing damage on a hit. Once on each of your turns when you attack with a claw using the Attack action, you can make one additional claw attack as part of the same action.

	Tail. You grow a lashing, spiny tail, which deals 1d8 piercing damage on a hit and has the reach property. If a creature you can see within 10 feet of you hits you with an attack roll, you can use your reaction to swipe your tail and roll a d8, applying a bonus to your AC equal to the number rolled, potentially causing the attack to miss you.
*/
const version = "10.0.0";
const optionName = "Form of the Beast";
const effectName = "form-of-the-beast";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const barbarianLevel = actor.classes.barbarian?.system.levels ?? 0;
	
	if (args[0].macroPass === "preItemRoll") {
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			ui.notifications.error(`${optionName}: not raging`);
			return false;
		}
		
		return true;
	}	
	else if (args[0] === "on") {
		// Ask which form to take
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>Which Transformation?</p>",
				buttons: {
					bite: {
						icon: '<img src = "icons/creatures/abilities/mouth-teeth-sharp.webp" width="50" height="50" />',
						label: "<p>Bite</p>",
						callback: () => { resolve("bite") }
					},
					claws: {
						icon: '<img src = "icons/creatures/abilities/paw-print-orange.webp" width="50" height="50" />',
						label: "<p>Claws</p>",
						callback: () => { resolve("claws") }
					},
					tail: {
						icon: '<img src = "icons/creatures/abilities/tail-swipe-green.webp" width="50" height="50" />',
						label: "<p>Tail</p>",
						callback: () => { resolve("tail") }
					}
				},
				default: "bite"
			}).render(true);
		});

		let transformationName = await dialog;
		if (transformationName) {
			const magicAttack = barbarianLevel > 5;
			
			if (transformationName === "bite") {
				await applyBiteTransform(actorToken, lastArg.sourceItemUuid, magicAttack);
				ui.notifications.info(`${optionName} - Beast Bite has been added to your features`);
			}
			else if (transformationName === "claws") {
				await applyClawsTransform(actorToken, magicAttack);
				ui.notifications.info(`${optionName} - Beast Claws has been added to your features`);
			}
			else if (transformationName === "tail") {
				await applyTailTransform(actorToken, lastArg.sourceItemUuid, magicAttack);
				ui.notifications.info(`${optionName} - Beast Tail has been added to your features`);
			}
		}
	}
	else if (args[0] === "off") {
		await warpgate.revert(actorToken.document, optionName);
	}
	else if (args[0] === "each") {
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			await warpgate.revert(actorToken.document, optionName);
			
			let optionEffect = actor.effects.find(i => i.label === optionName);
			if (optionEffect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [optionEffect.id] }); 
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyBiteTransform(actorToken, origin, magicAttack) {
	const beastBiteAttack = {
		embedded: {
			Item: {
				"Beast Bite": {
					"type": "feat",
					"img": "icons/creatures/abilities/mouth-teeth-sharp.webp",
					"system": {
						"description": {
						  "value": "<p>Your mouth transforms into a bestial muzzle or great mandibles (your choice). It deals 1d8 piercing damage on a hit. Once on each of your turns when you damage a creature with this bite, you regain a number of hit points equal to your proficiency bonus, provided you have less than half your hit points when you hit.</p>",
						  "chat": "",
						  "unidentified": ""
						},
						"source": "",
						"activation": {
						  "type": "action",
						  "cost": 1,
						  "condition": ""
						},
						"duration": {
						  "value": "",
						  "units": "inst"
						},
						"target": {
						  "value": 1,
						  "width": null,
						  "units": "",
						  "type": "creature"
						},
						"range": {
						  "value": 5,
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
						"ability": "str",
						"actionType": "mwak",
						"attackBonus": "",
						"chatFlavor": "",
						"critical": {
						  "threshold": null,
						  "damage": ""
						},
						"damage": {
						  "parts": [
							[
							  "1d8 + @mod",
							  "piercing"
							]
						  ],
						  "versatile": ""
						},
						"formula": "",
						"save": {
						  "ability": "",
						  "dc": null,
						  "scaling": "spell"
						},
						"type": {
						  "value": "class",
						  "subtype": ""
						},
						"requirements": "",
						"recharge": {
						  "value": null,
						  "charged": false
						}
					},
					"effects": [
					{
					  "label": "Bite Transformation",
					  "icon": "icons/creatures/abilities/mouth-teeth-sharp.webp",
					  "origin": origin,
					  "duration": {
						"startTime": null,
						"seconds": null,
						"combat": null,
						"rounds": null,
						"turns": null,
						"startRound": null,
						"startTurn": null
					  },
					  "disabled": false,
					  "_id": "aT0K5UmYq4dY0EgP",
					  "changes": [
						{
						  "key": "flags.dnd5e.DamageBonusMacro",
						  "mode": 0,
						  "value": "ItemMacro.Beast Bite",
						  "priority": 20
						}
					  ],
					  "tint": null,
					  "transfer": true,
					  "flags": {
						"times-up": {},
						"dfreds-convenient-effects": {
						  "description": ""
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
						}
					  }
					}],
					"flags": {
						"scene-packer": {
						  "hash": "8e8fd421f8cf276b7d5961838e11143b376b4193",
						  "sourceId": "Item.uwfWq4IcLPRCtEOs"
						},
						"midi-qol": {
						  "fumbleThreshold": null,
						  "effectActivation": false
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
						  "magicdam": magicAttack,
						  "magiceffect": false,
						  "concentration": false,
						  "toggleEffect": false,
						  "ignoreTotalCover": false
						},
						"itemacro": {
						  "macro": {
							"name": "Beast Bite",
							"type": "script",
							"scope": "global",
							"command": "/*\n\tYour mouth transforms into a bestial muzzle or great mandibles (your choice). It deals 1d8 piercing damage on a hit. Once on each of your turns when you damage a creature with this bite, you regain a number of hit points equal to your proficiency bonus, provided you have less than half your hit points when you hit.\n*/\nconst version = \"10.0.0\";\nconst optionName = \"Beast Bite\";\nconst timeFlag = \"beast-bite-time\";\n\ntry {\n\tif (args[0].macroPass === \"DamageBonus\") {\n\t\tconst lastArg = args[args.length - 1];\n\t\tconst actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);\n\t\tconst actorToken = canvas.tokens.get(lastArg.tokenId);\n\t\tconst sourceItem = fromUuid(lastArg.sourceItemUuid);\n\t\t\n\t\t// make sure the actor is raging\n\t\tif (!hasEffectApplied(\"Rage\", actor)) {\n\t\t\tconsole.log(`${optionName}: not raging`);\n\t\t\treturn {};\n\t\t}\n\n\t\t// make sure it's a beast bite attack\n\t\tif (lastArg.item.name != optionName) {\n\t\t\tconsole.log(`${optionName}: not an eligible attack`);\n\t\t\treturn {};\n\t\t}\n\t\t\n\t\t// Check for availability i.e. first hit on the actors turn\n\t\tif (!isAvailableThisTurn() || !game.combat) {\n\t\t\tconsole.log(`${optionName} - not available this attack`);\n\t\t\treturn {};\n\t\t}\n\t\t\n\t\t// make sure the actor has half their hp total\n\t\tlet half = Math.ceil(actor.system.attributes.hp.max / 2);\n\t\tif (actor.system.attributes.hp.value >= half) {\n\t\t\tconsole.log(`${optionName} - not available, too many hp`);\n\t\t\treturn {};\n\t\t}\n\n\t\t// heal the barbarian\n\t\tconst pb = actor.system.attributes.prof;\n\t\tawait MidiQOL.applyTokenDamage(\n\t\t\t[{ damage: pb, type: 'healing' }],\n\t\t\tpb,\n\t\t\tnew Set([actorToken]),\n\t\t\tlastArg.item,\n\t\t\tnull\n\t\t);\n\t\t\n\t\t// set the time flag\n\t\tconst combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;\n\t\tconst lastTime = actor.getFlag(\"midi-qol\", timeFlag);\n\t\tif (combatTime !== lastTime) {\n\t\t\tawait actor.setFlag(\"midi-qol\", timeFlag, combatTime)\n\t\t}\n\t}\n\n} catch (err) {\n    console.error(`Combat Maneuver: ${optionName} ${version}`, err);\n}\n\nfunction hasEffectApplied(effectName, actor) {\n  return actor.effects.find((ae) => ae.label === effectName) !== undefined;\n}\n\n// Check to make sure the actor hasn't already applied the damage this turn\nfunction isAvailableThisTurn() {\n\tif (game.combat) {\n\t  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;\n\t  const lastTime = actor.getFlag(\"midi-qol\", timeFlag);\n\t  if (combatTime === lastTime) {\n\t\t  console.log(`${optionName}: already used this turn`);\n\t\t  return false;\n\t  }\t  \n\t  return true;\n\t}\n\t\n\treturn false;\n}",
							"author": "5vlmE3uiS7OIQTEf",
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
						},
						"core": {
						},
						"exportSource": {
						  "world": "test-5e",
						  "system": "dnd5e",
						  "coreVersion": "10.291",
						  "systemVersion": "2.1.5"
						}
					},
					"_stats": {
						"systemId": "dnd5e",
						"systemVersion": "2.1.5",
						"coreVersion": "10.291",
						"createdTime": 1680903719351,
						"modifiedTime": 1680906285774,
						"lastModifiedBy": "5vlmE3uiS7OIQTEf"
					}
				}
			}
		}
	};
	
	await warpgate.mutate(actorToken.document, beastBiteAttack, {}, { name: optionName });
}

async function applyClawsTransform(actorToken, magicAttack) {
	const beastClawsAttack = {
		embedded: {
			Item: {
				"Beast Claws": {
					"type": "feat",
					"img": "icons/creatures/abilities/paw-print-orange.webp",
					"system": {
						"description": {
						  "value": "<p>Each of your hands transforms into a claw, which you can use as a weapon if it’s empty. It deals 1d6 slashing damage on a hit. Once on each of your turns when you attack with a claw using the Attack action, you can make one additional claw attack as part of the same action.</p>",
						  "chat": "",
						  "unidentified": ""
						},
						"source": "",
						"activation": {
						  "type": "action",
						  "cost": 1,
						  "condition": ""
						},
						"duration": {
						  "value": "",
						  "units": "inst"
						},
						"target": {
						  "value": 1,
						  "width": null,
						  "units": "",
						  "type": "creature"
						},
						"range": {
						  "value": 5,
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
						"ability": "str",
						"actionType": "mwak",
						"attackBonus": "",
						"chatFlavor": "",
						"critical": {
						  "threshold": null,
						  "damage": ""
						},
						"damage": {
						  "parts": [
							[
							  "1d6 + @mod",
							  "slashing"
							]
						  ],
						  "versatile": ""
						},
						"formula": "",
						"save": {
						  "ability": "",
						  "dc": null,
						  "scaling": "spell"
						},
						"type": {
						  "value": "class",
						  "subtype": ""
						},
						"requirements": "",
						"recharge": {
						  "value": null,
						  "charged": false
						}
					},
					"effects": [],
					"flags": {
						"midi-qol": {
						  "fumbleThreshold": null,
						  "effectActivation": false
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
						  "magicdam": magicAttack,
						  "magiceffect": false,
						  "concentration": false,
						  "toggleEffect": false,
						  "ignoreTotalCover": false
						},
						"core": {
						},
						"exportSource": {
						  "world": "test-5e",
						  "system": "dnd5e",
						  "coreVersion": "10.291",
						  "systemVersion": "2.1.5"
						}
					},
					"_stats": {
						"systemId": "dnd5e",
						"systemVersion": "2.1.5",
						"coreVersion": "10.291",
						"createdTime": 1680903719351,
						"modifiedTime": 1680906285774,
						"lastModifiedBy": "5vlmE3uiS7OIQTEf"
					}
				}
			}
		}
	};
	
	await warpgate.mutate(actorToken.document, beastClawsAttack, {}, { name: optionName });
}

async function applyTailTransform(actorToken, origin, magicAttack) {
	const beastTail = {
		embedded: {
			Item: {
				"Beast Tail": {
					"type": "feat",
					"img": "icons/creatures/abilities/tail-swipe-green.webp",
					"system": {
						"description": {
						  "value": "<p>You grow a lashing, spiny tail, which deals 1d8 piercing damage on a hit and has the reach property. If a creature you can see within 10 feet of you hits you with an attack roll, you can use your reaction to swipe your tail and roll a d8, applying a bonus to your AC equal to the number rolled, potentially causing the attack to miss you.</p>",
						  "chat": "",
						  "unidentified": ""
						},
						"source": "",
						"activation": {
						  "type": "action",
						  "cost": 1,
						  "condition": ""
						},
						"duration": {
						  "value": "",
						  "units": "inst"
						},
						"target": {
						  "value": 1,
						  "width": null,
						  "units": "",
						  "type": "creature"
						},
						"range": {
						  "value": 10,
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
						"ability": "str",
						"actionType": "mwak",
						"attackBonus": "",
						"chatFlavor": "",
						"critical": {
						  "threshold": null,
						  "damage": ""
						},
						"damage": {
						  "parts": [
							[
							  "1d8 + @mod",
							  "piercing"
							]
						  ],
						  "versatile": ""
						},
						"formula": "",
						"save": {
						  "ability": "",
						  "dc": null,
						  "scaling": "spell"
						},
						"type": {
						  "value": "class",
						  "subtype": ""
						},
						"requirements": "",
						"recharge": {
						  "value": null,
						  "charged": false
						}
					},
					"effects": [],
					"flags": {
						"midi-qol": {
						  "fumbleThreshold": null,
						  "effectActivation": false
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
						  "magicdam": magicAttack,
						  "magiceffect": false,
						  "concentration": false,
						  "toggleEffect": false,
						  "ignoreTotalCover": false
						},
						"core": {
						},
						"exportSource": {
						  "world": "test-5e",
						  "system": "dnd5e",
						  "coreVersion": "10.291",
						  "systemVersion": "2.1.5"
						}
					},
					"_stats": {
						"systemId": "dnd5e",
						"systemVersion": "2.1.5",
						"coreVersion": "10.291",
						"createdTime": 1680903719351,
						"modifiedTime": 1680906285774,
						"lastModifiedBy": "5vlmE3uiS7OIQTEf"
					}
				},
				"Beast Tail Swipe": {
					"type": "feat",
					"img": "icons/creatures/abilities/tail-swipe-green.webp",
					"system": {
					"description": {
					  "value": "<p>If a creature you can see within 10 feet of you hits you with an attack roll, you can use your reaction to swipe your tail and roll a d8, applying a bonus to your AC equal to the number rolled, potentially causing the attack to miss you.</p>",
					  "chat": "",
					  "unidentified": ""
					},
					"source": "",
					"activation": {
					  "type": "reaction",
					  "cost": 1,
					  "condition": ""
					},
					"duration": {
					  "value": "",
					  "units": ""
					},
					"target": {
					  "value": null,
					  "width": null,
					  "units": "",
					  "type": "self"
					},
					"range": {
					  "value": null,
					  "long": null,
					  "units": "self"
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
					"ability": null,
					"actionType": "",
					"attackBonus": "",
					"chatFlavor": "",
					"critical": {
					  "threshold": null,
					  "damage": ""
					},
					"damage": {
					  "parts": [],
					  "versatile": ""
					},
					"formula": "",
					"save": {
					  "ability": "",
					  "dc": null,
					  "scaling": "spell"
					},
					"type": {
					  "value": "class",
					  "subtype": ""
					},
					"requirements": "",
					"recharge": {
					  "value": null,
					  "charged": false
					}
					},
					"effects": [
					{
					  "label": "Beast Tail Swipe",
					  "icon": "icons/creatures/abilities/tail-swipe-green.webp",
					  "origin": origin,
					  "duration": {
						"startTime": null,
						"seconds": null,
						"combat": null,
						"rounds": null,
						"turns": null,
						"startRound": null,
						"startTurn": null
					  },
					  "disabled": false,
					  "_id": "7mZEQViT71VrLsnQ",
					  "changes": [
						{
						  "key": "system.attributes.ac.bonus",
						  "mode": 2,
						  "value": "1d8",
						  "priority": 20
						}
					  ],
					  "tint": null,
					  "transfer": false,
					  "flags": {
						"times-up": {},
						"dfreds-convenient-effects": {
						  "description": ""
						},
						"dae": {
						  "selfTarget": false,
						  "selfTargetAlways": true,
						  "stackable": "none",
						  "durationExpression": "",
						  "macroRepeat": "none",
						  "specialDuration": [
							"1Reaction"
						  ]
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
						}
					  }
					}
					],
					"flags": {
						"scene-packer": {
						},
						"core": {
						},
						"exportSource": {
						  "world": "test-5e",
						  "system": "dnd5e",
						  "coreVersion": "10.291",
						  "systemVersion": "2.1.5"
						}
					},
					"_stats": {
						"systemId": "dnd5e",
						"systemVersion": "2.1.5",
						"coreVersion": "10.291",
						"createdTime": 1681003359850,
						"modifiedTime": 1681003499873,
						"lastModifiedBy": "5vlmE3uiS7OIQTEf"
					}
					
				}
			}
		}
	};
	
	await warpgate.mutate(actorToken.document, beastTail, {}, { name: optionName });	
}
