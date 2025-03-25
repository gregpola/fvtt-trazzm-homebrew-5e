/*
	The next time you hit a creature with a melee weapon attack during this spell’s duration, your weapon pierces both
	body and mind, and the attack deals an extra 4d6 psychic damage to the target. The target must make a Wisdom saving
	throw. On a failed save, it has disadvantage on attack rolls and ability checks, and can’t take reactions, until the
	end of its next turn.
 */
const version = "11.1";
const optionName = "Staggering Smite";

try {
	if (args[0].macroPass === "DamageBonus") {
		let targetToken = workflow.hitTargets.first();

		// validate targeting
		if (!actor || !targetToken) {
			console.log(`${optionName}: no target selected`);
			return {};
		}

		// make sure it's an allowed attack
		if (!["mwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack: ${workflow.item.system.actionType}`);
			return {};
		}

		// roll save for target
		const saveDC = actor.system.attributes.spelldc;
		const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;

		let saveRoll = await targetToken.actor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "psychic"});
		if (saveRoll.total < saveDC) {
			let effectData = {
				name: 'Staggering Smite effects',
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
				origin: workflow.origin,
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

		await anime(token, targetToken);
		if (workflow.isCritical)
			return {damageRoll: `1d6+6[psychic]`, flavor: `${optionName} Damage`};
		return {damageRoll: `1d6[psychic]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.grey")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}

