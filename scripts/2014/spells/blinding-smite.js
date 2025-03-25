/*
	The next time you hit a creature with a melee weapon attack during this spell’s duration, you weapon flares with a
	bright light, and the attack deals an extra 3d8 radiant damage to the target. Additionally, the target must succeed
	on a Constitution saving throw or be Blinded until the spell ends.

	A creature blinded by this spell makes another Constitution saving throw at the end of each of its turns. On a
	successful save, it is no longer blinded.
 */
const version = "11.0";
const optionName = "Blinding Smite";
const flagName = "blinding-smite-used";
const gameRound = game.combat ? game.combat.round : 0;
const damageType = game.i18n.localize("radiant");
const effectName = "Blinded by Smite";


try {
	if (args[0].macroPass === "DamageBonus") {	
		const target = workflow.hitTargets.first();

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		if (!["mwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack: ${workflow.item.system.actionType}`);
			return {};
		}

		// check if used (for handling burning)
		let flag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (flag) {
			console.log(`${optionName}: already applied the damage bonus`);
			return {};
		}

		// set the flag
		await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, target.actor.uuid);

		// add burning effect
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;

		let saveType = game.i18n.localize("con");
		let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType,
			options: { chatMessage: true, fastForward: false } });

		if (save.total < dc) {
			let effectData = new ActiveEffect({
				name: effectName,
				icon: "icons/magic/perception/eye-ringed-glow-angry-small-teal.webp",
				origin: actor.uuid,
				changes: [
					{
						key: `flags.midi-qol.OverTime`,
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: `turn=end, saveAbility=con, saveDC=${dc}, label=Blinded`,
						priority: 20
					},
					{key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Blinded", priority: 21}
				],
				duration: {seconds: 60}
			});
			await MidiQOL.socket().executeAsGM("createEffects", {
				actorUuid: target.actor.uuid,
				effects: [effectData.toObject()]
			})
			ChatMessage.create({
				content: `${target.name} is blinded by positive energy`,
				speaker: ChatMessage.getSpeaker({actor: actor})
			});
		}

		await anime(token, target);

		// add damage bonus
		if (workflow.isCritical) {
			return {damageRoll: `3d8+24[${damageType}]`, flavor: optionName};
		}
		return {damageRoll: `3d8[${damageType}]`, flavor: optionName};
	}
	else if (args[0] === "off") {
		// delete the used flag
		const lastFlag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (lastFlag) {
			await actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);
			let entity = await fromUuid(lastFlag);
			if (entity) {
				let effect = entity.effects.find(e => e.name === effectName && e.origin === actor.uuid);
				if (effect) {
					await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: entity.uuid, effects: [effect.id] });
				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.dark_black")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}
