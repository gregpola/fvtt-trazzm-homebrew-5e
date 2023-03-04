/*
	In addition, you can invoke the rune as a bonus action to enter a prophetic state for 1 minute or until you’re Incapacitated. Until the state ends, when you or another creature you can see within 60 feet of you makes an attack roll, a saving throw, or an ability check, you can use your reaction to cause the roll to have advantage or disadvantage. Once you invoke this rune, you can’t do so again until you finish a short or long rest.
*/
const version = "10.0.0";
const optionName = "Storm Rune";
const mutationFlag = "storm-rune";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {

        if (!game.modules.get("warpgate")?.active) {
			ui.notifications.error("Please enable the Warp Gate module");
			return;
		}
		
		// Add manual reaction features to the actor
		const updates = {
			embedded: {
				Item: {
					"Storm Rune - Grant Advantage": {
						"type": "feat",
						"img": "icons/magic/lightning/bolt-cloud-sky-white.webp",
						"system": {
							"description": {
								"value": "Until the state ends, when you or another creature you can see within 60 feet of you makes an attack roll, a saving throw, or an ability check, you can use your reaction to cause the roll to have advantage."
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
								"value":60,
								"long":null,
								"units": "ft"
							}
						},
						"effects": [
						{
							"label": "Storm Rune - Advantage",
							"icon": "icons/magic/lightning/bolt-cloud-sky-white.webp",
							"origin": `${lastArg.origin}`,
							"transfer": false,
							"changes": [
								{
									"key": "flags.midi-qol.advantage.attack.all",
									"mode": 0,
									"value": "1",
									"priority": 20
								},
								{
									"key": "flags.midi-qol.advantage.ability.check.all",
									"mode": 0,
									"value": "1",
									"priority": 20
								},
								{
									"key": "flags.midi-qol.advantage.ability.save.all",
									"mode": 0,
									"value": "1",
									"priority": 20
								}
							],
							"flags": {
								"dae": {
									"specialDuration": ["1Attack", "isSave", "isCheck", "turnStart"],
									"selfTarget": false,
									"selfTargetAlways": false,
								}
							}
						}],
					},
					"Storm Rune - Grant Disadvantage": {
						"type": "feat",
						"img": "icons/magic/lightning/bolt-cloud-sky-green.webp",
						"system": {
							"description": {
								"value": "Until the state ends, when you or another creature you can see within 60 feet of you makes an attack roll, a saving throw, or an ability check, you can use your reaction to cause the roll to have disadvantage."
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
								"value":60,
								"long":null,
								"units": "ft"
							}
						},
						"effects": [
						{
							"label": "Storm Rune - Advantage",
							"icon": "icons/magic/lightning/bolt-cloud-sky-white.webp",
							"origin": `${lastArg.origin}`,
							"transfer": false,
							"changes": [
								{
									"key": "flags.midi-qol.disadvantage.attack.all",
									"mode": 0,
									"value": "1",
									"priority": 20
								},
								{
									"key": "flags.midi-qol.disadvantage.ability.check.all",
									"mode": 0,
									"value": "1",
									"priority": 20
								},
								{
									"key": "flags.midi-qol.disadvantage.ability.save.all",
									"mode": 0,
									"value": "1",
									"priority": 20
								}
							],
							"flags": {
								"dae": {
									"specialDuration": ["1Attack", "isSave", "isCheck", "turnStart"],
									"selfTarget": false,
									"selfTargetAlways": false,
								}
							}
						}],
					}
				}
			}
		};
		
		//update the token and create the feature
		await warpgate.mutate(actorToken.document, updates, {}, { name: mutationFlag });

	}
	else if (args[0] === "off") {
		await warpgate.revert(actorToken.document, mutationFlag);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
