/*
	When you score a Critical Hit that deals Bludgeoning damage to a creature, attack rolls against that creature have
	Advantage until the start of your next turn.
 */
const version = "12.4.1";
const optionName = "Crusher - Enhanced Critical";

try {
	if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
		if (!workflow.isCritical) {
			console.debug(`${optionName}: ${version} - not a critical hit`);
			return;
		}

		// make sure it's an allowed attack
		if (workflow.damageDetail.filter(i=>i.type === "bludgeoning").length < 1) {
			console.debug(`${optionName}: ${version} - not bludgeoning damage`);
			return;
		}

		const effect_sourceData = {
			changes: [{ key: "flags.midi-qol.grants.advantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 2}],
			origin: item.uuid,
			duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
			icon: "icons/weapons/hammers/hammer-double-stone.webp",
			name: optionName,
			flags: {dae: {specialDuration: ['turnStartSource']}},
		};

		for (let targetToken of workflow.hitTargets) {
			let effect = HomebrewHelpers.findEffect(targetToken.actor, optionName);
			if (effect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
			}
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effect_sourceData] });
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
