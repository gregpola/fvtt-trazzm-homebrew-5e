const version = "12.3.1";
const optionName = "Crusher";
const effectLabel = "Crusher feat - Grants advantage on all attacks";
const timeFlag = "crusher-time";

try {
	if (args[0].macroPass === "DamageBonus" && workflow.hitTargets.size > 0) {
		let targetToken = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (workflow.damageDetail.filter(i=>i.type === "bludgeoning").length < 1) {
			console.log(`${optionName} not allowed: not a bludgeoning attack`);
			return {};
		}
	
		// if a critical apply the debuff
		if (workflow.isCritical) {
			const effect_sourceData = {
				changes: [{ key: "flags.midi-qol.grants.advantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 2}],
				origin: item.uuid,
				duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
				icon: "icons/weapons/hammers/hammer-double-stone.webp",
				name: effectLabel,
				flags: {dae: {specialDuration: ['turnStartSource']}},
			}
			
			let effect = HomebrewHelpers.findEffect(targetToken.actor, effectLabel);
			if (effect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
			}
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effect_sourceData] });
		}

		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
			return;
		}

		// Ask for move
		const moveTarget = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: 'Crusher feat move target 5ft',
			},
			content: `<p>Do you want to move ${targetToken.name} 5ft in a direction of your choice?</p>`,
			rejectClose: false,
			modal: true
		});

		if (moveTarget) {
			await new Portal()
				.color("#ff0000")
				.texture("icons/svg/target.svg")
				.origin(targetToken)
				.range(5)
				.teleport();

			// set the usage flag
			await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
