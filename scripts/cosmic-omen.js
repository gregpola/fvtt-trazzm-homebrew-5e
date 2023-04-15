/*
	Whenever you finish a long rest, you can consult your Star Map for omens. When you do so, roll a die. Until you finish your next long rest, you gain access to a special reaction based on whether you rolled an even or an odd number on the die:

	Weal (even). Whenever a creature you can see within 30 feet of you is about to make an attack roll, a saving throw, or an ability check, you can use your reaction to roll a d6 and add the number rolled to the total.

	Woe (odd). Whenever a creature you can see within 30 feet of you is about to make an attack roll, a saving throw, or an ability check, you can use your reaction to roll a d6 and subtract the number rolled from the total.

	You can use this reaction a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Cosmic Omen";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		// roll a die to determine which omen is received
		let roll = new Roll('1d10').evaluate({ async: false });
		await game.dice3d?.showForRoll(roll);
		
		// add the omen
		if ((roll.total % 2) === 0) {
			await addCosmicWeal(actorToken, lastArg.origin);
		}
		else {
			await addCosmicWoe(actorToken, lastArg.origin);
		}
	}
	else if (args[0] === "off") {
        await warpgate.revert(actorToken.document, optionName);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function addCosmicWeal(actorToken, origin) {
	const pb = actorToken.actor.system.attributes.prof;
	
	// Add manual reaction feature to the actor
	const updates = {
		embedded: {
			Item: {
				"Cosmic Omen - Weal": {
					"type": "feat",
					"img": "icons/magic/control/buff-luck-fortune-green.webp",
					"system": {
						"description": {
							"value": "Whenever a creature you can see within 30 feet of you is about to make an attack roll, a saving throw, or an ability check, you can use your reaction to roll a d6 and add the number rolled from the total."
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
							"value": 30,
							"long": null,
							"units": "feet"
						},
						"duration": {
							"value": null,
							"units": ""
						},
						"uses": {
						  "value": pb,
						  "max": "@prof",
						  "per": "lr",
						  "recovery": ""
						},
						"cover": null,
					},
					"effects": [
					{
						"label": "Cosmic Omen - Weal",
						"icon": "icons/magic/control/buff-luck-fortune-green.webp",
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
								"key": "system.bonuses.All-Attacks",
								"mode": 0,
								"value": "1d6",
								"priority": 20
							},
							{
								"key": "system.bonuses.abilities.check",
								"mode": 0,
								"value": "1d6",
								"priority": 20
							},
							{
								"key": "system.bonuses.abilities.skill",
								"mode": 0,
								"value": "1d6",
								"priority": 20
							},
							{
								"key": "system.bonuses.abilities.save",
								"mode": 0,
								"value": "1d6",
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
								"specialDuration": ["1Action", "isSave", "isCheck", "isSkill"]
							},
							"core": {
								"statusId": ""
							}
						}
					}],
				}
			}
		}
	};

	// update the token and create the feature
	await warpgate.mutate(actorToken.document, updates, {}, { name: optionName });
	ui.notifications.info(`${optionName} - Cosmic Weal has been added to your features`);
}

async function addCosmicWoe(actorToken, origin) {
	const pb = actorToken.actor.system.attributes.prof;
	
	// Add manual reaction feature to the actor
	const updates = {
		embedded: {
			Item: {
				"Cosmic Omen - Woe": {
					"type": "feat",
					"img": "icons/magic/perception/hand-eye-pink.webp",
					"system": {
						"description": {
							"value": "Whenever a creature you can see within 30 feet of you is about to make an attack roll, a saving throw, or an ability check, you can use your reaction to roll a d6 and subtract the number rolled from the total."
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
							"value": 30,
							"long": null,
							"units": "feet"
						},
						"duration": {
							"value": null,
							"units": ""
						},
						"uses": {
						  "value": pb,
						  "max": "@prof",
						  "per": "lr",
						  "recovery": ""
						},
						"cover": null,
					},
					"effects": [
					{
						"label": "Cosmic Omen - Woe",
						"icon": "icons/magic/perception/hand-eye-pink.webp",
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
								"key": "system.bonuses.All-Attacks",
								"mode": 0,
								"value": "-1d6",
								"priority": 20
							},
							{
								"key": "system.bonuses.abilities.check",
								"mode": 0,
								"value": "-1d6",
								"priority": 20
							},
							{
								"key": "system.bonuses.abilities.skill",
								"mode": 0,
								"value": "-1d6",
								"priority": 20
							},
							{
								"key": "system.bonuses.abilities.save",
								"mode": 0,
								"value": "-1d6",
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
								"specialDuration": ["1Action", "isSave", "isCheck", "isSkill"]
							},
							"core": {
								"statusId": ""
							}
						}
					}],
				}
			}
		}
	};

	// update the token and create the feature
	await warpgate.mutate(actorToken.document, updates, {}, { name: optionName });
	ui.notifications.info(`${optionName} - Cosmic Woe has been added to your features`);
}
