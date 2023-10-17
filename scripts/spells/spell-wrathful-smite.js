const version = "10.0.0";
const optionName = "Wrathful Smite";
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const target = args[0].hitTargets[0];
		let tactor = target?.actor;

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
		
		// remove the effect, since it is one-time
		let effect = actor.effects?.find(i=>i.label === optionName);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}

		// save versus frightened
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;
		let saveType = game.i18n.localize("wis");
		let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: tactor.uuid, ability: saveType, 
			options: { chatMessage: true, fastForward: false } });
			
	    if (save.total < dc) {
			await markAsFrightened(tactor.uuid, actor.uuid, dc, saveType);
		}
		else {
			// if it saves, just drop the concentration
			let conc = actor.effects?.find(i=>i.label === game.i18n.localize("Concentrating"));
			if (conc) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [conc.id] });
			}
		}

		// add damage bonus
		const diceMult = args[0].isCritical ? 2: 1;
		let damageType = game.i18n.localize("psychic");
		return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function markAsFrightened(targetId, actorId, spellDC, saveType) {
    let condition = game.i18n.localize("Frightened");
    let conditionFlags = { "dae": { "token": actorId } };

	const effectData = {
		label: condition,
		icon: "icons/svg/terror.svg",
		origin: actorId,
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Frightened",
				priority: 20
			},
            {
				key: `flags.midi-qol.OverTime`, 
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 
				value: `turn=start,label=${condition},saveDC=${spellDC},saveAbility=${saveType}`, 
				priority: 20
			}
		],
		duration: { 
			rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime 
		},
		flags: conditionFlags,
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
