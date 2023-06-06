/*
	You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal
	an extra {@dice 1d6} damage to the target whenever you hit it with a weapon attack, and you have advantage on any
	Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this
	spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.
 */
const version = "10.1";
const optionName = "Hunter's Mark";
const targetOptionName = "Hunter's Marked";
const targetFlagName = "hunters-mark-target";

try {
	if (args[0].macroPass === "DamageBonus") {
		let targetToken = workflow?.hitTargets?.first();
		if (targetToken) {
			const targetFlag = actor.getFlag("world", targetFlagName);
			if (targetFlag) {
				let isMarked = targetToken.actor.effects.find(i => i.label === targetOptionName && i.origin === targetFlag.origin);

				if (isMarked) {
					let damageType = workflow.item.system.damage.parts[0][1];
					const diceMult = workflow.isCritical ? 2: 1;
					return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: "Hunter's Mark Damage"};
				}
			}
		}

	}
	else if (args[0].macroPass === "postActiveEffects") {
		// flag the target
		let targetActor = workflow?.targets?.first()?.actor;
		if (targetActor) {
			actor.setFlag("world", targetFlagName, { targetId: targetActor.uuid, origin: workflow.item.uuid});

			// get the actual duration
			let durationMod = (workflow.itemLevel === 3 || workflow.itemLevel === 4) ? 8
				: (workflow.itemLevel >= 5 ? 24 : 1);
			let duration = 3600 * durationMod;

			const hmEffect = actor.effects.find(eff=>eff.label === item.name);
			const updatedDuration = deepClone(hmEffect.duration);
			updatedDuration.seconds = duration;
			hmEffect.update({updatedDuration});

			// apply effect to the target
			let targetEffectData = {
				'label': targetOptionName,
				'icon': workflow.item.img,
				'origin': workflow.item.uuid,
				'duration': {
					'seconds': duration
				},
				'flags': { 'dae': { 'specialDuration': ["zeroHP"] } }
			};
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [targetEffectData]});
		}
	}
	else if (args[0] === "on") {
		// add the move target item to the source actor
		await applyMoveMark(token);
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
    console.error(`${optionName}: ${version}`, err);
}

async function applyMoveMark(actorToken) {
	// The Starry Form - Archer attack
	const moveTarget = {
		embedded: {
			Item: {
				"Hunter's Mark - Mark New Target": {
					"type": "spell",
					"img": "icons/skills/ranged/target-bullseye-arrow-green.webp",
					"system": {
						"description": {
							"value": "<p><span style=\"font-family:Signika, sans-serif\">If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.</span></p>",
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
						"school": "div",
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
							"hash": "a90121d16dafee69623d3e722754abbb33843564",
							"sourceId": "Item.dnHcCJUgX0ujC9MO"
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
								"name": "HMM",
								"type": "script",
								"scope": "global",
								"command": "const version = \"10.1\";\nconst optionName = \"Hunter's Mark Re-Mark\";\nconst targetOptionName = \"Hunter's Marked\";\nconst targetFlagName = \"hunters-mark-target\";\n\ntry {\n    if (args[0].macroPass === \"preItemRoll\") {\n        let result = true;\n        let oldEffect;\n        let oldTargetName;\n\n        // make sure the current target is dead\n        const targetFlag = actor.getFlag(\"world\", targetFlagName);\n        if (targetFlag) {\n            let targetToken = await fromUuid(targetFlag.targetId);\n\n            if (targetToken) {\n                if (targetToken.actor.system.attributes.hp.value > 0) {\n                    result = false;\n                    oldTargetName = targetToken.actor.name;\n                }\n                else {\n                    oldEffect = targetToken.actor.effects.find(i => i.label === targetOptionName && i.origin === targetFlag.origin);\n                    if (oldEffect) {\n                        await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: targetToken.actor.uuid, effects: [oldEffect.id] });\n                    }\n                }\n            }\n        }\n\n        let targetActor = workflow?.targets?.first()?.actor;\n        if (targetActor && result) {\n            actor.setFlag(\"world\", targetFlagName, { targetId: targetActor.uuid, origin: targetFlag.origin});\n\n            // apply effect to the target\n            let targetEffectData = {\n                'label': targetOptionName,\n                'icon': workflow.item.img,\n                'origin': targetFlag.origin,\n                'duration': {\n                    'seconds': 3600\n                },\n                'flags': { 'dae': { 'specialDuration': [\"zeroHP\"] } }\n\n            };\n            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [targetEffectData]});\n        }\n\n        if (!result) {\n            ChatMessage.create({\n                content: `Unable to re-apply Hunter's Mark - ${oldTargetName} is still alive`,\n                speaker: ChatMessage.getSpeaker({ actor: actor })});\n        }\n\n        return result;\n    }\n\n} catch (err) {\n    console.error(`${optionName}: ${version}`, err);\n}",
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
						"createdTime": 1686002747101,
						"modifiedTime": 1686014481736,
						"lastModifiedBy": "5vlmE3uiS7OIQTEf"
					}
				}
			}
		}
	};

	await warpgate.mutate(actorToken, moveTarget, {}, { name: optionName });
}
