const version = "0.1.0";
const optionName = "Branding Smite";
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const target = args[0].hitTargets[0];
		let tactor = target?.actor;
		const ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
		let pusher = canvas.tokens.get(args[0].tokenId);

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak", "rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// get the spell level prior to removing the effect
		const spellLevel = actor.data.flags["midi-qol"]?.brandingSmite?.level ?? 2;
		
		// remove the effect, since it is one-time
		let effect = actor.effects?.find(i=>i.data.label === optionName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}

		// remove invisible condition
		let invis = tactor.effects?.find(i=>i.data.label === "Invisible");
		if (invis) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [invis.id] });
		}
		
		// add light effect
        let bsEffect = new ActiveEffect({label: "Branding Smite", icon: "icons/magic/fire/dagger-rune-enchant-flame-blue.webp", 
			changes: [{value: 5, mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE, priority: 20, key:"ATL.dimLight"}], 
			duration: {seconds: 60}});
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tactor.uuid, effects: [bsEffect.toObject()]})

		// add damage bonus
		const levelMulti = Math.max(spellLevel - 1, 1);
		const critMulti = args[0].isCritical ? 2: 1;
		const totalDice = 2 * levelMulti * critMulti;
		let damageType = game.i18n.localize("radiant");
		return {damageRoll: `${totalDice}d6[${damageType}]`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
