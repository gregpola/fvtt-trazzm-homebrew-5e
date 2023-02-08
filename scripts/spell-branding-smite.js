/*
	The next time you hit a creature with a weapon attack before this spell ends, the weapon gleams with astral radiance as you strike. The attack deals an extra 2d6 radiant damage to the target, which becomes visible if it is Invisible, and the target sheds dim light in a 5-foot radius and can’t become Invisible until the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the extra damage increases by 1d6 for each slot level above 2nd.
*/
const version = "10.0.0";
const optionName = "Branding Smite";
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "DamageBonus") {	
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetActor = lastArg.hitTargets[0].actor;

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// get the spell level prior to removing the effect
		const spellLevel = actor.flags["midi-qol"]?.brandingSmite?.level ?? 2;

		// remove invisible condition
		let invis = targetActor.effects?.find(i=>i.label === "Invisible");
		if (invis) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetActor.uuid, effects: [invis.id] });
		}
		await game.dfreds.effectInterface.removeEffect({effectName: 'Invisible', uuid:targetActor.uuid});
		
		// add light effect
        let bsEffect = new ActiveEffect({label: "Branding Smite", icon: "icons/magic/fire/dagger-rune-enchant-flame-blue.webp", 
			changes: [{value: 5, mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE, priority: 20, key:"ATL.dimLight"}], 
			duration: {seconds: 60}});
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetActor.uuid, effects: [bsEffect.toObject()]})

		// add damage bonus
		const levelMulti = Math.max(spellLevel - 1, 1);
		const critMulti = lastArg.isCritical ? 2: 1;
		const totalDice = 2 * levelMulti * critMulti;
		let damageType = game.i18n.localize("radiant");
		return {damageRoll: `${totalDice}d6[${damageType}]`, flavor: optionName};
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
