/*
	The next time you hit with a melee weapon attack during this spell’s duration, your attack deals an extra 1d6 psychic
	damage. Additionally, if the target is a creature, it must make a Wisdom saving throw or be Frightened of you until
	the spell ends. As an action, the creature can make a Wisdom check against your spell save DC to steel its resolve
	and end this spell.
 */
const version = "12.3.1";
const optionName = "Wrathful Smite";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "wrathful-smite-used";
const damageType = game.i18n.localize("psychic");

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
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// check if used (for handling frightened)
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			console.log(`${optionName}: already applied the damage bonus`);
			return {};
		}

		// set the flag
		await actor.setFlag(_flagGroup, flagName, target.actor.uuid);

		// get the remaining time from the spell
		let frightenedDuration = undefined;
		const spellEffect = actor.effects.find(e => e.name === optionName);
		if (spellEffect) {
			frightenedDuration = deepClone(spellEffect.duration);
		}

		// save versus frightened
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;
		let saveType = game.i18n.localize("wis");
		let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType,
			options: { chatMessage: true, fastForward: false } });
			
	    if (save.total < dc) {
			await HomebrewEffects.applyFrightenedEffect(target.actor, macroItem.uuid, undefined, 60);
		}

		await anime(token, target);

		// add damage bonus
		if (workflow.isCritical)
			return {damageRoll: `1d6+6[${damageType}]`, flavor: optionName};
		return {damageRoll: `1d6[${damageType}]`, flavor: optionName};
	}
	else if (args[0] === "off") {
		// delete the used flag
		const lastFlag = actor.getFlag(_flagGroup, flagName);
		if (lastFlag) {
			await actor.unsetFlag(_flagGroup, flagName);
			const targetActor = await fromUuid(lastFlag);
			await HomebrewEffects.removeEffectByNameAndOrigin(targetActor, 'Frightened', macroItem.uuid);
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.blue")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}
