/*
	Starting at 2nd level when you choose this school, glimpses of the future begin to press in on your awareness. When you finish a long rest, roll two d20s and record the numbers rolled. You can replace any attack roll, saving throw, or ability check made by you or a creature that you can see with one of these foretelling rolls. You must choose to do so before the roll, and you can replace a roll in this way only once per turn.

	Each foretelling roll can be used only once. When you finish a long rest, you lose any unused foretelling rolls.
	
	Starting at 14th level, the visions in your dreams intensify and paint a more accurate picture in your mind of what is to come. You roll three d20s for your Portent feature, rather than two.
*/
const version = "10.0.0";
const optionName = "Portent";
const lastArg = args[args.length - 1];

try {
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		const wizardLevel = actor.classes.wizard?.system.levels ?? 0;
		let itemCount = 2;
		
		// roll the portent dice
		let countOne = 1;
		let rollOne = new Roll('1d20').evaluate({ async: false });
		await game.dice3d?.showForRoll(rollOne);

		let countTwo = 1;
		let rollTwo = new Roll('1d20').evaluate({ async: false });
		await game.dice3d?.showForRoll(rollTwo);
		if (rollTwo.total === rollOne.total) {
			countOne = countOne + 1;
			countTwo = 0;
			itemCount = itemCount - 1;
		}

		let countThree = 0;
		let rollThree = undefined;
		if (wizardLevel > 13) {
			countThree = 1;
			rollThree = new Roll('1d20').evaluate({ async: false });
			await game.dice3d?.showForRoll(rollThree);

			if (rollThree.total === rollOne.total) {
				countOne = countOne + 1;
				countThree = 0;
			}
			else if (rollThree.total === rollTwo.total) {
				countTwo = countTwo + 1;
				countThree = 0;
			}
			else {
				itemCount = itemCount + 1;
			}
		}
		
		// add features to the actor to handle usage
		let portentOne = buildPortentItem(actorToken, rollOne.total, countOne);
		
		let portentTwo = undefined;
		if (countTwo) {
			portentTwo = buildPortentItem(actorToken, rollTwo.total, countTwo);
		}
		
		let portentThree = undefined;
		if (countThree) {
			portentThree = buildPortentItem(actorToken, rollThree.total, countThree);
		}
		
		// Add the item(s)
		let updates = undefined;
		if (itemCount === 1) {
			updates = {
				'embedded': {
					'Item': {
						[`Portent die (${rollOne.total})`]: portentOne
					}
				}
			};
		}
		else if (itemCount === 2) {
			updates = {
				'embedded': {
					'Item': {
						[`Portent die (${rollOne.total})`]: portentOne,
						[`Portent die (${rollTwo.total})`]: portentTwo
					}
				}
			};
		}
		else if (itemCount === 3) {
			updates = {
				'embedded': {
					'Item': {
						[`Portent die (${rollOne.total})`]: portentOne,
						[`Portent die (${rollTwo.total})`]: portentTwo,
						[`Portent die (${rollThree.total})`]: portentThree
					}
				}
			};
		}

		await warpgate.mutate(actorToken.document, updates, {}, { name: optionName });
		ui.notifications.info(`${optionName} - Dice have been added to your features`);
		
	}
	else if (args[0] === "off") {
        await warpgate.revert(actorToken.document, optionName);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function buildPortentItem(actorToken, portentDie, uses) {
	let portentData = {
		"type": "feat",
		"img": "icons/commodities/treasure/crystal-ball-blue-purple.webp",
		"system": {
			"description": {
				"value": "You can replace any attack roll, saving throw, or ability check made by you or a creature that you can see with one of these foretelling rolls. You must choose to do so before the roll, and you can replace a roll in this way only once per turn."
			},
			"activation": {
				"type": "special",
				"cost": 1
			},
			"target": {
				"value": 1,
				"type": "creature"
			},
			"range": {
				"value": null,
				"long": null,
				"units": "any"
			},
			"duration": {
				"value": null,
				"units": ""
			},
			"uses": {
			  "value": uses,
			  "max": uses,
			  "per": "charges",
			  "recovery": ""
			},
			"cover": null,
		},
		"effects": [
		{
			"label": "Portent",
			"icon": "icons/commodities/treasure/crystal-ball-blue-purple.webp",
			"origin": lastArg.sourceItemUuid,
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
					key: 'flags.midi-qol.max.skill.all',
					value: portentDie,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				},
				{
					key: 'flags.midi-qol.max.ability.save.all',
					value: portentDie,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				},
				{
					key: 'flags.midi-qol.max.skill.all',
					value: portentDie,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				},
				{
					key: 'flags.midi-qol.min.ability.check.all',
					value: portentDie,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				},
				{
					key: 'flags.midi-qol.min.ability.save.all',
					value: portentDie,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				},
				{
					key: 'flags.midi-qol.min.skill.all',
					value: portentDie,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				}
			],
			"tint": null,
			"transfer": false,
			"flags": {
				"trazzm": {
					"portentRoll" : portentDie
				},
				"dae": {
					"selfTarget": false,
					"selfTargetAlways": false,
					"stackable": "none",
					"durationExpression": "",
					"macroRepeat": "none",
					"specialDuration": ["1Attack", "isSave", "isCheck", "isSkill"]
				},
				"core": {
					"statusId": ""
				}
			}
		}],
	};
	
	return portentData;
}
