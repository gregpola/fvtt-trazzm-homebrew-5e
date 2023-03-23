const version = "10.0.0";
const optionName = "Bigby's Hand";
const summonFlag = "bigbys-hand";
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

// Grasping Hand
const lastArg = args[args.length - 1];
let grappler = canvas.tokens.get(lastArg.tokenId);
const defender = lastArg.targets[0];
const defenderToken = canvas.tokens.get(defender.id);
			
const defenderSize = defenderToken.actor.system.traits.size;
const medIndex = actorSizes.indexOf("med");
const dindex = actorSizes.indexOf(defenderSize);
const withAdvantage = (dindex <= medIndex);

const hugeIndex = actorSizes.indexOf("huge");
if (dindex > hugeIndex) {
	ui.notifications.error(`${optionName}: target is too big to grapple`);
	return;
}

// run opposed check
let grapplerRoll = await grappler.actor.rollAbilityTest("str", {advantage: withAdvantage});

const skilltoberolled = defenderToken.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
let defenderRoll = await defenderToken.actor.rollSkill(skilltoberolled);

if (grapplerRoll.total >= defenderRoll.total) {
	// grapple the target
	await applyGrappled(grappler, defender, skilltoberolled);
	ChatMessage.create({'content': `${grappler.name} grapples ${defenderToken.name}`})
}

async function applyGrappled(grappler, defender, skillForBreakFree) {
	let grappledEffect = {
		'label': 'Grappled',
		'icon': 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
		'changes': [
			{
				'key': 'macro.CE',
				'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				'value': 'Grappled',
				'priority': 30
			}
		],
		'origin': grappler.actor.uuid,
		'duration': {'seconds': 3600}
	};
	await defender.actor.createEmbeddedDocuments("ActiveEffect", [grappledEffect]);

	// add the break free feature to the target
	let escapeMacro = "let effect = token.actor.effects.find(ef => ef.label === 'Grappled' && ef.origin === '" + grappler.actor.uuid + "');\n"
		+ "if (effect) {\n"
		+ "let grappler = canvas.tokens.placeables.find(p => p.actor.uuid === '" + grappler.actor.uuid + "');\n"
		+ "  let result = await game.MonksTokenBar.requestContestedRoll("
		+ "{token: token, request:'skill:" + skillForBreakFree + "'},"
		+ "{token: grappler, request: 'skill:ath'},"
		+ "{silent:true, fastForward:true, flavor: '" + defender.name + " tries to break free'});\n"
		+ "  if (result.passed?.id === token.id) {\n"
		+ "    await effect.delete();\n"
		+ "    await warpgate.revert(token.document, 'Escape Grapple');\n"
		+ "    ChatMessage.create({'content': '" + defender.name + " escapes the grapple!'});\n"
		+ "  }\n"
		+ "  else {\n"
		+ "    ChatMessage.create({'content': '" + defender.name + " fails to break the grapple'});\n}\n"
		+ "}";
	
	const updates = {
		embedded: {
			Item: {
				"Escape Grapple" : {
					"type": "feat",
					"img": "icons/magic/nature/root-vine-entangled-hands.webp",
					"system": {
						"description": {
							"value": "As an action, you can make a Strength (Athletics) or Dexterity (Acrobatics) check contested by the grapplers Strength (Athletics) check."
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
								"name": "Escape Grapple",
								"type": "script",
								"scope": "global",
								"command": escapeMacro
							}
						}
					},
				}
			}
		}
	};
	await warpgate.mutate(defender, updates, {}, { name: "Escape Grapple" });
}

