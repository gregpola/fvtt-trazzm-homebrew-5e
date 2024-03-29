/*
	Starting at 2nd level, you can call forth nature spirits to influence the world around you. As a bonus action, you can magically summon an incorporeal spirit to a point you can see within 60 feet of you. The spirit creates an aura in a 30-foot radius around that point. It counts as neither a creature nor an object, though it has the spectral appearance of the creature it represents.

	As a bonus action, you can move the spirit up to 60 feet to a point you can see.

	The spirit persists for 1 minute or until you’re Incapacitated. Once you use this feature, you can’t use it again until you finish a short or long rest.
*/
const version = "11.0";
const optionName = "Spirit Totem";
const summonFlag = "spirit-totem";
const bearTotemId = "uMowTZFFeR2KBSAS";
const hawkTotemId = "kZqN4DrBUL4BOlz6";
const unicornTotemId = "E2OxvVXjfdExsyVs";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const sourceItem = await fromUuid(lastArg.origin);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) {
			ui.notifications.error("Please enable the Warp Gate module");
			return;
		}
		
		// Ask which type of totem to summon
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>Which spirit form should be summoned?</p>",
				buttons: {
					bear: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-bear.webp" width="50" height="50" />',
						label: "<p>Bear</p>",
						callback: () => { resolve({id: bearTotemId, name: "Totem Spirit - Bear"}) }
					},
					hawk: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-hawk.webp" width="50" height="50" />',
						label: "<p>Hawk</p>",
						callback: () => { resolve({id: hawkTotemId, name: "Totem Spirit - Hawk"}) }
					},
					unicorn: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-unicorn.webp" width="50" height="50" />',
						label: "<p>Unicorn</p>",
						callback: () => { resolve({id: unicornTotemId, name: "Totem Spirit - Unicorn"}) }
					}
				},
				default: "one"
			}).render(true);
		});

		let totemActorData = await dialog;
		if (totemActorData) {
			const summonName = `${totemActorData.name} (${actor.name})`;
			
			// build the update data for the totem
			let updates = {
				token: {
					"name": summonName,
					"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
					"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
					"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
					"bar1": { attribute: "attributes.hp" },
					"actorLink": false,
					"flags": { "midi-srd": { "Spirit Totem" : { "ActorId": actor.id } } }
				},
				"name": summonName
			};
			
			// get the actor
			let summonActor = game.actors.getName(summonName);
			if (!summonActor) {
				// Get from the compendium
				const summonId = totemActorData.id;
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
				summonActor = game.actors.getName(summonName);
			}

			// Spawn the result
			const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 60;
			let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
			if (position) {
				const spawned = await warpgate.spawnAt(position, summonName, {}, { controllingActor: actor }, {});
				if (!spawned || !spawned[0]) {
					ui.notifications.error(`${optionName} - unable to spawn the animals`);
					return false;
				}

				let summonedToken = canvas.tokens.get(spawned[0]);
				if (summonedToken) {
					// Get the spirit totem's aura origin for removal
					let effectOrigin;
					let effect = summonedToken.actor.effects.entries().next().value;
					if (effect) {
						effectOrigin = effect[1].origin;
					}
					await actor.setFlag("midi-qol", summonFlag, {tokenId: summonedToken.id, sourceId: effectOrigin});
				
					// Apply other totem effects
					if (totemActorData.id === bearTotemId) {
						const druidLevel = actor.classes.druid?.system.levels ?? 0; // TODO how handle NPC's
						const tempHps = 5 + druidLevel;
						
						// ask which tokens to give temp hp to
						const possibleTargets = MidiQOL.findNearby(null, summonedToken, 30);
						if (possibleTargets.length > 0) {
							// build the target data
							let rows = "";
							for (let t of possibleTargets) {
								let row = `<div><input type="checkbox" style="margin-right:10px;" value=${t.id}/><label>${t.name}</label></div>`;
								rows += row;
							}
							
							// build dialog content
							let content = `
								<form>
									<div class="flexcol">
										<div class="flexrow" style="margin-bottom: 10px;"><label>Select who gets ${tempHps} temporary hit points:</label></div>
										<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
											${rows}
										</div>
									</div>
								</form>`;
								
							new Dialog({
								title: optionName,
								content,
								buttons: {
									Ok:	{
										label: `Ok`,
										callback: async (html) => {
											var grid = document.getElementById("targetRows");
											var checkBoxes = grid.getElementsByTagName("INPUT");
											let recipients = [];
											for (var i = 0; i < checkBoxes.length; i++) {
												if (checkBoxes[i].checked) {
													let target = possibleTargets[i];
													if(!target.actor.system.attributes.hp.temp || (target.actor.system.attributes.hp.temp < tempHps)) {
														recipients.push(target.name);
														await target.actor.update({ "system.attributes.hp.temp" : tempHps });
													}
												}
											}
											
											if (recipients.length > 0) {
												const rec = recipients.toString();
												ChatMessage.create({
													content: `${actor.name}'s Bear Spirit provided temporary hit points to: ${rec}`,
													speaker: ChatMessage.getSpeaker({ actor: actor })});
											}
										}
									}
								}
							}).render(true);
						}
					}
					else if (totemActorData.id === hawkTotemId) {
						// Add manual reaction feature to the actor
						const updates = {
							embedded: {
								Item: {
									"Totem Spirit Hawk - Grant Advantage": {
										"type": "feat",
										"img": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-hawk.webp",
										"system": {
											"description": {
												"value": "When a creature makes an attack roll against a target in the spirit’s aura, you can use your reaction to grant advantage to that attack roll."
											},
											"activation": {
												"type": "reactionmanual",
												"cost": 1
											},
											"target": {
												"value": 1,
												"type": "creature"
											},
											"range": {
												"value":null,
												"long":null,
												"units": "any"
											},
											"duration": {
												"value": null,
												"units": ""
											},
											"cover": null,
										},
										"effects": [
										{
											"label": "Hawk Spirit Totem - Advantage",
											"icon": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-hawk.webp",
											"origin": `${actor.uuid}`,
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
											"changes": [
											{
												"key": "flags.midi-qol.grants.advantage.attack.all",
												"mode": 0,
												"value": "1",
												"priority": 20
											}
											],
											"tint": null,
											"transfer": false,
											"flags": {
												"times-up": {},
												"dae": {
													"selfTarget": false,
													"selfTargetAlways": false,
													"stackable": "none",
													"durationExpression": "",
													"macroRepeat": "none",
													"specialDuration": ["1Attack"]
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
									}
								}
							}
						};
						
						//update the token and create the feature
						await warpgate.mutate(actorToken.document, updates);
						
					}
					else if (totemActorData.id === unicornTotemId) {
						/*
						You and your allies gain advantage on all ability checks made to detect creatures in the spirit’s aura. In addition, if you cast a spell using a spell slot that restores hit points to any creature inside or outside the aura, each creature of your choice in the aura also regains hit points equal to your druid level.*/
						// Add damage bonus macro to the actor
						const updates = {
							embedded: {
								Item: {
									"Totem Spirit Unicorn - Healing": {
										"type": "feat",
										"img": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-unicorn.webp",
										"system": {
											"description": {
											  "value": "<p>If you cast a spell using a spell slot that restores hit points to any creature inside or outside the aura, each creature of your choice in the aura also regains hit points equal to your druid level.</p>",
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
											  "label": "Unicorn Spirit Healing",
											  "icon": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/spirit-totem-unicorn.webp",
											  "origin": "Item.eQ8A2nam0CvoaRua",
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
											  "_id": "zwMvml8Zn6I1F9Ap",
											  "changes": [
												{
												  "key": "flags.dnd5e.DamageBonusMacro",
												  "mode": 0,
												  "value": "ItemMacro.Totem Spirit Unicorn - Healing",
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
												"name": "Unicorn Healing",
												"type": "script",
												"scope": "global",
												"command": "if (args[0].macroPass === \"DamageBonus\") {\n\tconst lastArg = args[args.length - 1];\n\tconst actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);\n\tconst actorToken = canvas.tokens.get(lastArg.tokenId);\n\tconst druidLevel = actor.classes.druid?.system.levels ?? 0;\n\t\n\t// make sure it's an heal\n\tif (![\"heal\"].includes(lastArg.itemData.system.actionType)) {\n\t\tconsole.log(`Spirit Totem (Unicorn Spirit): not a heal`);\n\t\treturn {};\n\t}\n\n\t// get the totem spirit\n\tconst summonData = actor.getFlag(\"midi-qol\", \"spirit-totem\");\n\tif (summonData) {\n\t\tlet spiritToken = game.canvas.tokens.get(summonData.tokenId);\n\t\tif (spiritToken) {\n\t\t\t// ask which tokens in the aura to heal\n\t\t\tconst possibleTargets = MidiQOL.findNearby(null, spiritToken, 30);\n\t\t\tif (possibleTargets.length > 0) {\n\t\t\t\t// build the target data\n\t\t\t\tlet rows = \"\";\n\t\t\t\tfor (let t of possibleTargets) {\n\t\t\t\t\tlet row = `<div><input type=\"checkbox\" style=\"margin-right:10px;\" value=${t.id}/><label>${t.name}</label></div>`;\n\t\t\t\t\trows += row;\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t// build dialog content\n\t\t\t\tlet content = `\n\t\t\t\t\t<form>\n\t\t\t\t\t\t<div class=\"flexcol\">\n\t\t\t\t\t\t\t<div class=\"flexrow\" style=\"margin-bottom: 10px;\"><label>Select who receives ${druidLevel} healing:</label></div>\n\t\t\t\t\t\t\t<div id=\"targetRows\" class=\"flexcol\"style=\"margin-bottom: 10px;\">\n\t\t\t\t\t\t\t\t${rows}\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</form>`;\n\t\t\t\t\t\n\t\t\t\tnew Dialog({\n\t\t\t\t\ttitle: \"Unicorn Spirit Healing\",\n\t\t\t\t\tcontent,\n\t\t\t\t\tbuttons: {\n\t\t\t\t\t\tOk:\t{\n\t\t\t\t\t\t\tlabel: `Ok`,\n\t\t\t\t\t\t\tcallback: async (html) => {\n\t\t\t\t\t\t\t\tvar grid = document.getElementById(\"targetRows\");\n\t\t\t\t\t\t\t\tvar checkBoxes = grid.getElementsByTagName(\"INPUT\");\n\t\t\t\t\t\t\t\tlet recipients = [];\n\t\t\t\t\t\t\t\tfor (var i = 0; i < checkBoxes.length; i++) {\n\t\t\t\t\t\t\t\t\tif (checkBoxes[i].checked) {\n\t\t\t\t\t\t\t\t\t\tlet target = possibleTargets[i];\n\t\t\t\t\t\t\t\t\t\trecipients.push(target);\n\t\t\t\t\t\t\t\t\t\t//await target.actor.applyDamage(-druidLevel);\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\tif (recipients.length > 0) {\n\t\t\t\t\t\t\t\t\tconst damageRoll = await new Roll(`${druidLevel}`).evaluate({ async: false });\n\t\t\t\t\t\t\t\t\tawait new MidiQOL.DamageOnlyWorkflow(actor, actorToken, damageRoll.total, \"healing\", recipients, damageRoll, \n\t\t\t\t\t\t\t\t\t\t{flavor: `Unicorn Spirit Healing`, itemCardId: args[0].itemCardId});\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}).render(true);\n\t\t\t}\n\t\t}\n\t}\n\telse {\n\t\tconsole.log(\"no spirit totem found\");\n\t}\n}",
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
						
						//update the token and create the feature
						await warpgate.mutate(actorToken.document, updates);
					}
				}
				
			}
			else {
				ui.notifications.error(`${optionName} - invalid conjure location`);
				return false;
			}
		}
	}
	else if (args[0] === "off") {
		// delete the totem
		const lastSummonData = actor.getFlag("midi-qol", summonFlag);
		if (lastSummonData) {
			await actor.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummonData.tokenId, game.canvas.scene.id);
			
			const tokens = game.canvas.scene.tokens;
			for (let t of tokens) {
			  let effect = t.actor.effects.find(i => i.label === "Aura of the Bear Spirit" && i.origin === lastSummonData.sourceId);
			  if (effect) await effect.delete();
			  
			  effect = t.actor.effects.find(i => i.label === "Aura of the Hawk Spirit" && i.origin === lastSummonData.sourceId);
			  if (effect) await effect.delete();
			  
			  effect = t.actor.effects.find(i => i.label === "Aura of the Unicorn Spirit" && i.origin === lastSummonData.sourceId);
			  if (effect) await effect.delete();
			}
		}
		
		// revert mutations
        await warpgate.revert(actorToken.document);
		
	}

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
