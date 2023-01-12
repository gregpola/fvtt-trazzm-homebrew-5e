const version = "10.0.0";
const optionName = "Searing Smite";
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const lastArg = args[args.length - 1];
		const target = lastArg.hitTargets[0];
		let tactor = target?.actor;
		const ttoken = canvas.tokens.get(lastArg.hitTargets[0].object.id);
		let pusher = canvas.tokens.get(lastArg.tokenId);

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		const at = args[0].item?.system?.actionType;
		if (!at || !["mwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// get the spell level prior to removing the effect
		const spellLevel = actor.flags["midi-qol"]?.searingSmite?.level ?? 1;
		
		// remove the effect, since it is one-time
		let effect = actor.effects?.find(i=>i.label === optionName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}
		
		// add burning effect
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;
		let damageType = game.i18n.localize("fire");
		
        let effectData = new ActiveEffect( 
		{
			label: optionName, 
			icon: "icons/magic/fire/dagger-rune-enchant-flame-blue-yellow.webp", 
			origin: lastArg.item.uuid,
			changes: [
			{
				key:"flags.midi-qol.OverTime",
				value: `"turn=start,saveAbility=con,saveDC=${dc},damageRoll=${spellLevel}d6,damageType=${damageType},label=${optionName}" `, 
				mode: 0, 
				priority: 20
			}], 
			duration: {seconds: 60}});
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tactor.uuid, effects: [effectData.toObject()]})
		await ChatMessage.create({content: `${target.name} is set on fire and begins to burn!`});

		// add damage bonus
		const levelMulti = Math.max(spellLevel, 1);
		const critMulti = args[0].isCritical ? 2: 1;
		const totalDice = levelMulti * critMulti;
		return {damageRoll: `${totalDice}d6[${damageType}]`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
