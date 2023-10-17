/*
	The next time you hit a creature with a melee weapon attack during this spell’s duration, your weapon pierces both
	body and mind, and the attack deals an extra 4d6 psychic damage to the target. The target must make a Wisdom saving
	throw. On a failed save, it has disadvantage on attack rolls and ability checks, and can’t take reactions, until the
	end of its next turn.
 */
const version = "10.0";
const optionName = "Staggering Smite";

try {
	if (args[0].macroPass === "DamageBonus") {
		const wf = scope.workflow;

		// make sure it's an allowed attack
		if (!["mwak"].includes(wf.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack: ${wf.item.system.actionType}`);
			return {};
		}

		// remove the effect, since it is one-time
		let effect = actor.effects.find(i=>i.label === optionName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}

		// roll save for target
		let targetToken = wf.hitTargets.first();
		if (targetToken) {
			const saveDC = actor.system.attributes.spelldc;
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"]} DC${saveDC} ${optionName}`;

			let saveRoll = await targetToken.actor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "psychic"});
			if (saveRoll.total < saveDC) {
				let effectData = {
					label: `${optionName}`,
					icon: 'icons/skills/melee/strike-hammer-destructive-orange.webp',
					changes: [
						{
							key: 'flags.midi-qol.disadvantage.attack.all',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: '1',
							priority: 20
						},
						{
							key: 'flags.midi-qol.disadvantage.ability.check.all',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: '1',
							priority: 20
						},
						{
							key: 'macro.CE',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: 'Reaction',
							priority: 20
						}
					],
					origin: wf.origin,
					flags: {
						dae: {
							selfTarget: false,
							stackable: "none",
							durationExpression: "",
							macroRepeat: "none",
							specialDuration: [
								"turnEnd"
							],
							transfer: false
						}
					},
				};

				await MidiQOL.socket().executeAsGM("createEffects",
					{ actorUuid: targetToken.actor.uuid, effects: [effectData] });

			}
		}

		const critMulti = wf.isCritical ? 2: 1;
		const totalDice = 4 * critMulti;
		return {damageRoll: `${totalDice}d6[psychic]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
