/*
	Ranged Weapon Attack: +8 to hit, range 30/60 ft., one target. Hit: The target is restrained by webbing. As an action, the restrained target can make a DC 15 Strength check, bursting the webbing on a success. The webbing can also be attacked and destroyed (AC 10; hp 5; vulnerability to fire damage; immunity to bludgeoning, poison, and psychic damage).
*/
const version = "10.0.0";
const optionName = "Webbed";
const mutationFlag = "drow-webbed";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) {
			ui.notifications.error("Please enable the Warp Gate module");
			return;
		}
		
		// add the break free option to the actors
		const updates = {
			embedded: {
				Item: {
					"Webbed - Break Free": {
						"type": "feat",
						"img": "icons/magic/control/buff-strength-muscle-damage.webp",
						"system": {
							"description": {
								"value": "As an action, the restrained target can make a DC 15 Strength check, bursting the webbing on a success."
							},
							"activation": {
								"type": "action",
								"cost": 1
							},
							"target": {
								"value": null,
								"type": "self"
							},
							"range": {
								"value":null,
								"long":null,
								"units": "self"
							},
							"duration": {
								"value": null,
								"units": "inst"
							},
							"cover": null,
						},
						"flags": {
							"midi-qol": {
								"onUseMacroName": "ItemMacro"
							},
							"itemacro": {
								"macro": {
									"name": "Break Free",
									"type": "script",
									"scope": "global",
									"command": "const dc = 15;\nconst roll = await token.actor.rollAbilityTest('str', {targetValue: dc});\nif (roll.total >= dc) {\nlet effect = token.actor.effects.find(ef => ef.label === 'Webbed');\nif (effect) await effect.delete();\nawait TokenMagic.deleteFilters(token);\nawait warpgate.revert(token.document, 'Webbed - Break Free');\nChatMessage.create({'content': `${token.name} breaks free of the webs!`});\n}"
								}
							}
						},
					}
				}
			}
		};
		
		// add the break free feature
		await warpgate.mutate(actorToken.document, updates, {}, { name: "Webbed - Break Free" });
		
		let params = 
		[{
			filterType: "web",
			filterId: "simpleweb",
			time: 100,
			div1: 20,
			div2: 10,
			animated :
			{
			  time : 
			  { 
				active: true, 
				speed: 0.0005, 
				animType: "move" 
			  }
			}
		}]

		await TokenMagic.addUpdateFilters(actorToken, params);		
	}

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

/*
									"command": "const dc = 15;\nconst roll = await token.actor.rollAbilityTest('str', {targetValue: dc});\nif (roll.total >= dc) {\nlet effect = token.actor.effects.find(ef => ef.label === 'Webbed');\nif (effect) await effect.delete();\nChatMessage.create({'content': `${token.name} breaks free of the webs!`});\n}"

									"command": "const dc = 15;\nconst e = event;\nconst roll = await token.actor.rollAbilityTest('str', {targetValue: dc});\nif (roll.total >= dc) {\nawait warpgate.revert(token.document, 'Webbed - Break Free');\nawait game.dfreds.effectInterface.removeEffect({effectName: 'Restrained', uuid: token.actor.uuid});\nChatMessage.create({'content': `${token.name} breaks free of the webs!`});\n}"
*/