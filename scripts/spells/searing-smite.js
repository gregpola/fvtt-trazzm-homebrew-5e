/*
	The next time you hit a creature with a melee weapon attack during the spell’s duration, your weapon flares with
	white-hot intensity, and the attack deals an extra 1d6 fire damage to the target and causes the target to ignite in
	flames. At the start of each of its turns until the spell ends, the target must make a Constitution saving throw. On
	a failed save, it takes 1d6 fire damage. On a successful save, the spell ends. If the target or a creature within 5
	feet of it uses an action to put out the flames, or if some other effect douses the flames (such as the target being
	submerged in water), the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the initial extra damage dealt by the attack increases by 1d6 for each slot.
 */
const version = "12.3.0";
const optionName = "Searing Smite";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "searing-smite-used";
const effectName = "Searing Smite burning";

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

		// get the spell level prior to removing the effect
		const spellLevel = actor.flags["midi-qol"]?.searingSmite?.level ?? 1;

		// check if used (for handling burning)
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			console.log(`${optionName}: already applied the damage bonus`);
			return {};
		}

		// set the flag
		await actor.setFlag(_flagGroup, flagName, target.actor.uuid);

		// add burning effect
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;
		let damageType = game.i18n.localize("fire");
		
        let effectData = new ActiveEffect( 
		{
			name: effectName,
			icon: "icons/magic/fire/dagger-rune-enchant-flame-strong-red.webp",
			origin: actor.uuid,
			changes: [
			{
				key:"flags.midi-qol.OverTime",
				value: `"turn=start,saveAbility=con,saveDC=${dc},damageRoll=${spellLevel}d6,damageType=${damageType},label=${effectName}" `,
				mode: 0, 
				priority: 20
			}], 
			duration: {seconds: 60}});
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [effectData.toObject()]})
		await ChatMessage.create({content: `${target.name} is set on fire and begins to burn!`});

		// add damage bonus
		const diceCount = Math.max(spellLevel, 1);
		if (workflow.isCritical) {
			const critDamage = diceCount * 6;
			return {damageRoll: `${diceCount}d6+${critDamage}[${damageType}]`, flavor: optionName};
		}
		return {damageRoll: `${diceCount}d6[${damageType}]`, flavor: optionName};
	}
	else if (args[0] === "off") {
		// delete the used flag
		const lastFlag = actor.getFlag(_flagGroup, flagName);
		if (lastFlag) {
			await actor.unsetFlag(_flagGroup, flagName);
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
