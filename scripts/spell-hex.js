/*
	You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic
	damage to the target whenever you hit it with an attack. Also, choose one ability when you cast the spell. The target
	has disadvantage on ability checks made with the chosen ability.

	If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours
	to curse a new creature.

	A remove curse cast on the target ends this spell early.

	*At Higher Levels. When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration
	on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your concentration
	on the spell for up to 24 hours.
 */
const version = "10.3";
const optionName = "Hex";
const targetOptionName = "Hex Marked";
const targetFlagName = "hex-target";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// flag the target
		let targetActor = workflow?.targets?.first()?.actor;
		if (targetActor) {
			// get the actual duration
			let durationMod = (workflow.itemLevel === 3 || workflow.itemLevel === 4) ? 8
				: (workflow.itemLevel >= 5 ? 24 : 1);
			let duration = 3600 * durationMod;

			// Ask which ability they want to hex
			new Dialog({
				title: 'Choose which ability the target will have disadvantage on ability checks with:',
				content: `
			  <form class="flexcol">
				<div class="form-group">
				  <select id="stat">
					<option value="str">Strength</option>
					<option value="dex">Dexterity</option>
					<option value="con">Constitution</option>
					<option value="int">Intelligence</option>
					<option value="wis">Wisdom</option>
					<option value="cha">Charisma</option>
				  </select>
				</div>
			  </form>
			`,
				buttons: {
					yes: {
						icon: '<i class="fas fa-bolt"></i>',
						label: 'Select',
						callback: async (html) => {
							let stat = html.find('#stat').val();
							actor.setFlag("world", targetFlagName, { targetId: targetActor.uuid, origin: workflow.item.uuid});

							const hexEffect = actor.effects.find(eff=>eff.label === item.name);
							const updatedDuration = deepClone(hexEffect.duration);
							updatedDuration.seconds = duration;
							hexEffect.update({updatedDuration});

							// Update concentration duration ??? update ???
							let concEffect = actor.effects.find(i => i.label === "Concentrating");
							const updatedConcDuration = deepClone(concEffect.duration);
							updatedConcDuration.seconds = duration;
							concEffect.update({updatedConcDuration});

							// apply effect to the target
							let targetEffectData = {
								'label': targetOptionName,
								'icon': workflow.item.img,
								'origin': workflow.item.uuid,
								'duration': {
									'seconds': duration
								},
								'changes': [
									{ 'key': `flags.midi-qol.disadvantage.ability.check.${stat}`,
										'mode': 5,
										'value': true,
										'priority': 10}
								],
								'flags': { 'dae': { 'specialDuration': ["zeroHP"] } }
							};
							await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [targetEffectData]});
						},
					},
				}
			}).render(true);
		}
	}
	else if (args[0].macroPass === "DamageBonus") {
		// only attacks
		if (["mwak","rwak","msak","rsak"].includes(workflow.item.system.actionType)) {
			let targetToken = workflow?.hitTargets?.first();
			if (targetToken) {
				const targetFlag = actor.getFlag("world", targetFlagName);
				if (targetFlag) {
					let isMarked = targetToken.actor.effects.find(i => i.label === targetOptionName && i.origin === targetFlag.origin);

					if (isMarked) {
						const diceMult = workflow.isCritical ? 2: 1;
						return {damageRoll: `${diceMult}d6[Necrotic]`, flavor: `${optionName} damage`};
					}
				}
			}
		}
	}
	else if (args[0] === "on") {
		// add the move target item to the source actor
		await applyMoveHex(token);
	}
	else if (args[0] === "off") {
		await warpgate.revert(token, optionName);

		const targetFlag = actor.getFlag("world", targetFlagName);
		if (targetFlag) {
			await actor.unsetFlag("world", targetFlagName);
			let targetToken = await fromUuid(targetFlag.targetId);
			if (targetToken) {
				let effect = targetToken.actor.effects.find(i => i.label === targetOptionName && i.origin === targetFlag.origin);
				if (effect) {
					// this hangs in dae/midi
					//await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': targetToken.actor.uuid, 'effects': [effect.id]});
				}
			}
		}
	}

} catch (err) {
    console.error(`Hex spell ${version}`, err);
}

async function applyMoveHex(actorToken) {
	// The Starry Form - Archer attack
	const moveTarget = {
		embedded: {
			Item: {
				"Hex - Curse New Target": {
					"type": "spell",
					"img": "icons/magic/unholy/hand-light-pink.webp",
					"system": {
						"description": {
							"value": "<p><span style=\"font-family:Signika, sans-serif\">If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to curse a new creature.</span></p>",
							"chat": "",
							"unidentified": ""
						},
						"source": "",
						"activation": {
							"type": "bonus",
							"cost": 1,
							"condition": ""
						},
						"duration": {
							"value": "1",
							"units": "hour"
						},
						"target": {
							"value": 1,
							"width": null,
							"units": "",
							"type": "creature"
						},
						"range": {
							"value": 90,
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
						"actionType": "util",
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
						"level": 0,
						"school": "enc",
						"components": {
							"vocal": false,
							"somatic": false,
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
						"scaling": {
							"mode": "none",
							"formula": ""
						}
					},
					"effects": [],
					"flags": {
						"scene-packer": {
							"hash": "edc27c23a72d9a7261cd6076949c925e76368739",
							"sourceId": "Item.xHwfT7MNXjtlK7Ub"
						},
						"walledtemplates": {
							"wallsBlock": "globalDefault",
							"wallRestriction": "globalDefault"
						},
						"midi-qol": {
							"effectActivation": false,
							"onUseMacroName": "[preItemRoll]ItemMacro"
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
								"name": "Hex - Curse New Target",
								"type": "script",
								"scope": "global",
								"command": "const version = \"10.1\";\nconst optionName = \"Hex - Curse New Target\";\nconst targetOptionName = \"Hex Marked\";\nconst targetFlagName = \"hex-target\";\n\ntry {\n    if (args[0].macroPass === \"preItemRoll\") {\n        let result = true;\n        let oldEffect;\n        let oldTargetName;\n\n        // make sure the current target is dead\n        const targetFlag = actor.getFlag(\"world\", targetFlagName);\n        if (targetFlag) {\n            let targetToken = await fromUuid(targetFlag.targetId);\n\n            if (targetToken) {\n                if (targetToken.actor.system.attributes.hp.value > 0) {\n                    result = false;\n                    oldTargetName = targetToken.actor.name;\n                }\n                else {\n                    oldEffect = targetToken.actor.effects.find(i => i.label === targetOptionName && i.origin === targetFlag.origin);\n                    if (oldEffect) {\n                        await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: targetToken.actor.uuid, effects: [oldEffect.id] });\n                    }\n                }\n            }\n        }\n\n        let targetActor = workflow?.targets?.first()?.actor;\n        if (targetActor && result) {\n\n            // Ask which ability they want to hex\n            new Dialog({\n                title: 'Choose which ability the target will have disadvantage on ability checks with:',\n                content: `\n\t\t\t  <form class=\"flexcol\">\n\t\t\t\t<div class=\"form-group\">\n\t\t\t\t  <select id=\"stat\">\n\t\t\t\t\t<option value=\"str\">Strength</option>\n\t\t\t\t\t<option value=\"dex\">Dexterity</option>\n\t\t\t\t\t<option value=\"con\">Constitution</option>\n\t\t\t\t\t<option value=\"int\">Intelligence</option>\n\t\t\t\t\t<option value=\"wis\">Wisdom</option>\n\t\t\t\t\t<option value=\"cha\">Charisma</option>\n\t\t\t\t  </select>\n\t\t\t\t</div>\n\t\t\t  </form>\n\t\t\t`,\n                buttons: {\n                    yes: {\n                        icon: '<i class=\"fas fa-bolt\"></i>',\n                        label: 'Select',\n                        callback: async (html) => {\n                            let stat = html.find('#stat').val();\n                            actor.setFlag(\"world\", targetFlagName, { targetId: targetActor.uuid, origin: targetFlag.origin});\n\n                            // apply effect to the target\n                            let targetEffectData = {\n                                'label': targetOptionName,\n                                'icon': workflow.item.img,\n                                'origin': targetFlag.origin,\n                                'duration': {\n                                    'seconds': 3600\n                                },\n                                'changes': [\n                                    { 'key': `flags.midi-qol.disadvantage.ability.check.${stat}`,\n                                        'mode': 5,\n                                        'value': true,\n                                        'priority': 10}\n                                ],\n                                'flags': { 'dae': { 'specialDuration': [\"zeroHP\"] } }\n                            };\n                            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [targetEffectData]});\n                        },\n                    },\n                }\n            }).render(true);\n        }\n\n        if (!result) {\n            ChatMessage.create({\n                content: `Unable to re-curse with Hex - ${oldTargetName} is still alive`,\n                speaker: ChatMessage.getSpeaker({ actor: actor })});\n        }\n\n        return result;\n    }\n\n} catch (err) {\n    console.error(`${optionName}: ${version}`, err);\n}",
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
						"createdTime": 1686083662304,
						"modifiedTime": 1686083795575,
						"lastModifiedBy": "5vlmE3uiS7OIQTEf"
					}
				}
			}
		}
	};

	await warpgate.mutate(actorToken.document, moveTarget, {}, { name: optionName });
}
