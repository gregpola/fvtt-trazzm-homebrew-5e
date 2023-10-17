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
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "preItemRoll") {
		// check for Rage
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(actor, resKey, 1);
	}	
	else if (args[0] === "on") {
		
		// Ask which form to take
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>Which starry form?</p>",
				buttons: {
					archer: {
						icon: '<img src = "icons/skills/ranged/person-archery-bow-attack-gray.webp" width="50" height="50" />',
						label: "<p>Archer</p>",
						callback: () => { resolve("archer") }
					},
					chalice: {
						icon: '<img src = "icons/containers/kitchenware/goblet-jeweled-engraved-red-gold.webp" width="50" height="50" />',
						label: "<p>Chalice</p>",
						callback: () => { resolve("chalice") }
					},
					dragon: {
						icon: '<img src = "icons/creatures/reptiles/dragon-horned-blue.webp" width="50" height="50" />',
						label: "<p>Dragon</p>",
						callback: () => { resolve("dragon") }
					}
				},
				default: "archer"
			}).render(true);
		});

		let starryFormName = await dialog;
		if (starryFormName) {
			if (starryFormName === "archer") {
				await applyArcherAttack(actorToken);
				ui.notifications.info("Starry Form - Archer Attack has been added to your At Will spells.");
			}
			else if (starryFormName === "chalice") {
				await applyChaliceHealing(actorToken);
			}
			else if (starryFormName === "dragon") {
				await applyDragonForm(actorToken, lastArg.origin, druidLevel);
			}
			
			// Apply the Full of Stars effect
			let fullOfStars = actor.items.find(i => i.name === "Full of Stars");
			if (fullOfStars) {
				const fullOfStarsEffectData = {
					label: fullOfStarsEffectName,
					icon: "icons/magic/defensive/barrier-shield-dome-deflect-blue.webp",
					origin: lastArg.origin,
					changes: [
						{
							key: 'system.traits.dr.value',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: 'bludgeoning',
							priority: 20
						},
						{
							key: 'system.traits.dr.value',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: 'piercing',
							priority: 20
						},
						{
							key: 'system.traits.dr.value',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: 'slashing',
							priority: 20
						}						
					],
					flags: {
						dae: {
							selfTarget: false,
							stackable: "none",
							durationExpression: "",
							macroRepeat: "none",
							specialDuration: [],
							transfer: false
						}
					},
					disabled: false
				};
				
				await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [fullOfStarsEffectData] });
			}
		}
	}
	else if (args[0] === "off") {
		await warpgate.revert(actorToken.document, optionName);
		
		let effect = actor.effects.find(i => i.label === dragonEffectName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}
		
		effect = actor.effects.find(i => i.label === fullOfStarsEffectName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}
	}
	else if (args[0] === "each") {
		if (druidLevel > 9) {
			let archerItem = actor.items.find(f => f.name === "Starry Form - Archer Attack" );
			let chaliceItem = actor.items.find(f => f.name === "Starry Form - Chalice" );
			let dragonEffect = actor.effects.find(i => i.label === dragonEffectName);
			let currentFormName = archerItem ? "Archer" : (chaliceItem ? "Chalice" : "Dragon");
			
			// build the buttons
			const buttons = {};
			if (!archerItem) 
				buttons["archer"] = {
					icon: '<img src = "icons/skills/ranged/person-archery-bow-attack-gray.webp" width="50" height="50" />',
					label: "<p>Archer</p>",
					callback: async () => {
						await warpgate.revert(actorToken.document, optionName);
						if (dragonEffect) {
							await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [dragonEffect.id] });
						}

						await applyArcherAttack(actorToken);
						ui.notifications.info("Starry Form - Archer Attack has been added to your At Will spells.");
					}
				}
				
			if (!chaliceItem) 
				buttons["chalice"] = {
					icon: '<img src = "icons/containers/kitchenware/goblet-jeweled-engraved-red-gold.webp" width="50" height="50" />',
					label: "<p>Chalice</p>",
					callback: async () => {
						await warpgate.revert(actorToken.document, optionName);
						if (dragonEffect) {
							await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [dragonEffect.id] });
						}

						await applyChaliceHealing(actorToken);
					}
				}
				
			if (!dragonEffect) 
				buttons["dragon"] = {
					icon: '<img src = "icons/creatures/reptiles/dragon-horned-blue.webp" width="50" height="50" />',
					label: "<p>Dragon</p>",
					callback: async () => {
						await warpgate.revert(actorToken.document, optionName);
						await applyDragonForm(actorToken, lastArg.origin, druidLevel);
					}
				}

			// Add the no button
			buttons["no"] = {
				icon: '<img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50" />',
				label: "<p>No</p>",
				callback: async () => {
					// nothing to do
					console.log(`${actor.name} opted to keep their current constellation`);
				}
			}
			
			new Dialog({
				title: "Font of Magic", 
				content: `<p>Do you want to change your constellation?</p><p>Current form: ${currentFormName}</p>`,
				buttons}).render(true);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDragonForm(actorToken, origin, druidLevel) {
	const dragonEffectData = {
		label: dragonEffectName,
		icon: "icons/creatures/reptiles/dragon-horned-blue.webp",
		origin: origin,
		changes: [
			{
				key: 'flags.midi-qol.min.ability.check.int',
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: '10',
				priority: 20
			},
			{
				key: 'flags.midi-qol.min.ability.check.wis',
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: '10',
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [],
				transfer: false
			}
		},
		disabled: false
	};
	
	if (druidLevel > 9) {
		dragonEffectData.changes.push({ key: "system.attributes.movement.fly", value: "20", mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE, priority: 25});
	}
	
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorToken.actor.uuid, effects: [dragonEffectData] });
}

async function applyArcherAttack(actorToken) {
	// The Starry Form - Archer attack
	const archerAttack = {
		embedded: {
			Item: {
				"Starry Form - Archer Attack": {
					"type": "spell",
					"img": "icons/skills/ranged/person-archery-bow-attack-gray.webp",
					"system": {
						"description": {
							"value": "<p>A constellation of an archer appears on you. When you activate this form, and as a bonus action on your subsequent turns while it lasts, you can make a ranged spell attack, hurling a luminous arrow that targets one creature within 60 feet of you. On a hit, the attack deals radiant damage equal to 1d8 + your Wisdom modifier.</p>"
						},
						"activation": {
							"type": "bonus",
							"cost": 1,
							"condition": ""
						},
						"duration": {
							"value": null,
							"units": "inst"
						},
						"cover": null,
						"target": {
							"value": 1,
							"width": null,
							"units": "",
							"type": "creature"
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
						"actionType": "rsak",
						"attackBonus": "0",
						"chatFlavor": "",
						"critical": {
							"threshold": null,
							"damage": ""
						},
						"damage": {
							"parts": [
								[
									"@scale.circle-of-stars.starry-form-dice + @mod",
									"radiant"
								]
							],
							"versatile": ""
						},
						"formula": "",
						"save": {
							"ability": "",
							"dc": null,
							"scaling": "none"
						},
						"level": 0,
						"school": "evo",
						"components": {
							"vocal": false,
							"somatic": false,
							"material": false,
							"ritual": false,
							"concentration": false,
							"value": ""
						},
						"materials": {
							"value": "",
							"consumed": false,
							"cost": 0,
							"supply": 0
						},
						"preparation": {
							"mode": "atwill",
							"prepared": true
						},
						"scaling": {
							"mode": "none",
							"formula": ""
						}
					},
					"effects": [
					],
					"sort": 0,
					"flags": {
						"favtab": {
							"isFavorite": true
						}
					}
				}
			}
		}
	};
	
	await warpgate.mutate(actorToken.document, archerAttack, {}, { name: optionName });
}

async function applyChaliceHealing(actorToken) {
	// Chalice healing effect
	const chaliceHealing = {
		embedded: {
			Item: {
				"Starry Form - Chalice": {
					"type": "feat",
					"img": "icons/containers/kitchenware/goblet-jeweled-engraved-red-gold.webp",
					"system": {
						"description": {
						  "value": "<p>A constellation of a life-giving goblet appears on you. Whenever you cast a spell using a spell slot that restores hit points to a creature, you or another creature within 30 feet of you can regain hit points equal to 1d8 + your Wisdom modifier.</p>",
						  "chat": "",
						  "unidentified": ""
						},
						"source": "",
						"activation": {
						  "type": "",
						  "cost": null,
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
						  "type": ""
						},
						"range": {
						  "value": null,
						  "long": null,
						  "units": ""
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
						  "label": "Chalice Healing",
						  "icon": "icons/containers/kitchenware/goblet-jeweled-engraved-red-gold.webp",
						  "origin": null,
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
						  "_id": "zwMvml8Zn6I1F9Az",
						  "changes": [
							{
							  "key": "flags.dnd5e.DamageBonusMacro",
							  "mode": 0,
							  "value": "ItemMacro.Starry Form - Chalice",
							  "priority": 20
							}
						  ],
						  "tint": null,
						  "transfer": true,
						  "flags": {
							"times-up": {},
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
						}
					],
					"flags": {
						"magicitems": {
						  "enabled": false,
						  "equipped": false,
						  "attuned": false,
						  "charges": "0",
						  "chargeType": "c1",
						  "destroy": false,
						  "destroyFlavorText": "reaches 0 charges: it crumbles into ashes and is destroyed.",
						  "rechargeable": false,
						  "recharge": "0",
						  "rechargeType": "t1",
						  "rechargeUnit": "r1",
						  "sorting": "l"
						},
						"itemacro": {
						  "macro": {
							"name": "Chalice Healing",
							"type": "script",
							"scope": "global",
							"command": "if (args[0].macroPass === \"DamageBonus\") {\n\tconst lastArg = args[args.length - 1];\n\tconst actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);\n\tconst actorToken = canvas.tokens.get(lastArg.tokenId);\n\t\n\t// make sure it's an heal and uses a spell slot\n\tif (![\"heal\"].includes(lastArg.itemData.system.actionType) && lastArg.spellLevel && (lastArg.spellLevel > 0)) {\n\t\tconsole.log(\"Starry Form - Chalice: not a heal spell\");\n\t\treturn {};\n\t}\n\n\t// ask show to heal\n\tconst friendlyTargets = MidiQOL.findNearby(1, actorToken, 60);\n\tconst neutralTargets = MidiQOL.findNearby(0, actorToken, 60);\n\tlet combinedTargets = [actorToken, ...friendlyTargets, ...neutralTargets];\n\tlet possibleTargets = combinedTargets.filter(function (target) {\n\t\treturn filterRecipient(actorToken, target);\n\t});\n\t\n\tif (possibleTargets.length === 0) {\n\t\tconsole.log(\"Starry Form - Chalice: not a heal spell\");\n\t\treturn {};\n\t}\n\t\n\t// build the target data\n\tlet target_content = ``;\n\tfor (let t of possibleTargets) {\n\t\ttarget_content += `<option value=${t.id}>${t.actor.name}</option>`;\n\t}\n\t\n\t// build dialog content\n\tlet content = `\n\t\t<div class=\"form-group\">\n\t\t  <p>Select nearby target to heal:</p>\n\t\t  <div style=\"margin: 10px;\">\n\t\t\t  <select name=\"healTarget\">\n\t\t\t\t${target_content}\n\t\t\t  </select>\n\t\t  </div>\n\t\t</div>`;\n\n\tlet dialog = new Promise((resolve, reject) => {\n\t\tnew Dialog({\n\t\t\ttitle: \"Starry Form - Chalice\",\n\t\t\tcontent,\n\t\t\tbuttons:\n\t\t\t{\n\t\t\t\tOk:\n\t\t\t\t{\n\t\t\t\t\tlabel: `OK`,\n\t\t\t\t\tcallback: async (html) => {\n\t\t\t\t\t\tlet healTargetId = html.find('[name=healTarget]')[0].value;\n\t\t\t\t\t\tconst healTarget = canvas.tokens.get(healTargetId);\n\t\t\t\t\t\tconst healDice = actor.system.scale[\"circle-of-stars\"][\"starry-form-dice\"];\n\t\t\t\t\t\tconst spellcasting = actor.system.abilities[\"wis\"].mod;\n\t\t\t\t\t\tconst healRoll = await new Roll(`${healDice} + ${spellcasting}`).evaluate({ async: false });\n\t\t\t\t\t\tawait game.dice3d?.showForRoll(healRoll);\n\t\t\t\t\t\tawait new MidiQOL.DamageOnlyWorkflow(actor, actorToken, healRoll.total, \"healing\", [healTarget], healRoll, {flavor: 'Starry Form - Chalice', itemCardId: 'new'});\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}).render(true);\n\t});\n}\n\nfunction filterRecipient(actorToken, target) {\n\tlet canSee = canvas.effects.visibility.testVisibility(actorToken.center, { object: target });\n\tlet totalHP = target.actor?.system.attributes.hp.value;\n\tlet maxHP = target.actor?.system.attributes.hp.max;\n\tlet disallowedTypes = [\"construct\", \"undead\"].includes(target.actor.system.details?.type?.value);\t\n\treturn canSee && (totalHP < maxHP) && !disallowedTypes;\n}",
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
						  "sourceId": "Item.eQ8A2nam0CvoaRua"
						}
					}
				}
			}
		}
	};
	
	await warpgate.mutate(actorToken.document, chaliceHealing, {}, { name: optionName });
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': `${resourceName} : Out of resources`});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
