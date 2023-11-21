/*
	The next time you hit a creature with a weapon attack before this spell ends, the weapon gleams with astral radiance
	as you strike. The attack deals an extra 2d6 radiant damage to the target, which becomes visible if it is Invisible,
	and the target sheds dim light in a 5-foot radius and can’t become Invisible until the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the extra damage increases by 1d6 for each slot level above 2nd.
*/
const version = "11.0";
const optionName = "Branding Smite";
const damageType = game.i18n.localize("radiant");
const flagName = "branding-smite-used";
const effectName = "Branding Smite no-hide";
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "DamageBonus") {	
		const target = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
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

		// get the spell level prior to removing the effect
		const spellLevel = actor.flags["midi-qol"]?.brandingSmite?.level ?? 2;

		// remove invisible condition
		let invis = target.actor.effects?.find(i=>i.name === "Invisible");
		if (invis) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [invis.id] });
		}
		await game.dfreds.effectInterface.removeEffect({effectName: 'Invisible', uuid:target.actor.uuid});
		
		// add light effect
		let effectData = new ActiveEffect(
			{
				name: effectName,
				icon: "icons/magic/fire/dagger-rune-enchant-flame-blue.webp",
				origin: actor.uuid,
				changes: [
					{
						key: "ATL.dimLight",
						value: 5,
						mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
						priority: 20
					}],
				duration: {seconds: 60}});
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [effectData.toObject()]})
		await anime(token, target);

		// add damage bonus
		const levelMulti = Math.max(spellLevel - 1, 1);
		const diceCount = 2 * levelMulti;

		if (workflow.isCritical) {
			const critDamage = diceCount * 6;
			return {damageRoll: `${diceCount}d6+${critDamage}[${damageType}]`, flavor: optionName};
		}
		return {damageRoll: `${diceCount}d6[${damageType}]`, flavor: optionName};
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
		.file("jb2a.misty_step.01.red")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}
