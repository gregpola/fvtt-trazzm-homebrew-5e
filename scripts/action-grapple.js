const version = "10.0.1";
const optionName = "Grapple Action";
const lastArg = args[args.length - 1];
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

try {
	let grappler = canvas.tokens.get(lastArg.tokenId);
	const defender = lastArg.targets[0];
	
	// check the size diff
	if (!isSizeEligible(grappler, defender)) {
		return ui.notifications.error(`${optionName} - target is too big to grapple`);
	}

	// Run the opposed skill check
	const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: grappler, request: 'skill:ath'},
		{token: defender, request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${grappler.name}'s shove attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${grappler.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	if (results.flags["monks-tokenbar"][`token${grappler.id}`].passed === "won") {
		await applyGrappled(grappler, defender, skilltoberolled);
		ChatMessage.create({'content': `${grappler.name} grapples ${defender.name}`})
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isSizeEligible(grappler, defender) {
	const grapplerSize = grappler.actor.system.traits.size;
	const defenderSize = defender.actor.system.traits.size;
	const gindex = actorSizes.indexOf(grapplerSize);
	const dindex = actorSizes.indexOf(defenderSize);
	return (dindex <= (gindex + 1));
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

	await MidiQOL.socket().executeAsGM("createEffects",
		{ actorUuid: defender.actor.uuid, effects: [grappledEffect] });

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
