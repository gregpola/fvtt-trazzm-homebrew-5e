const version = "10.0.0";
const optionName = "Cloak of Displacement";
const effectName = "Cloak of Displacement - Disadvantage";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const item = fromUuid(lastArg.origin);
	const gameRound = game.combat ? game.combat.round : 0;

	if (args[0] === "each" || "on") {
		// turn back on the disadvantage
		let effectData = [{
			label: effectName,
			icon: item.img,
			origin: lastArg.origin,
			transfer: false,
			disabled: false,
			duration: { startRound: gameRound, startTime: game.time.worldTime },
			flags: { dae: { specialDuration: ["isDamaged"] } },
			changes: [
				{ 
					'key': `flags.midi-qol.grants.disadvantage.attack.all`, 
					'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM, 
					'value': 1, 
					'priority': 20 
				},
			]
		}];
		let effect = actor.effects.find(i => i.label === effectName);
		if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: effectData });
	}
	else if (args[0] === "off") {
		let effect = actor.effects.find(i => i.label === effectName);
		if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
