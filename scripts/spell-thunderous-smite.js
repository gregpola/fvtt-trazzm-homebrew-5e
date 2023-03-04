const version = "10.0.1";
const optionName = "Thunderous Smite";
const squaresPushed = 2;

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

		// push the target logic
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;
		let saveType = game.i18n.localize("str");
		let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: tactor.uuid, ability: saveType, 
			options: { chatMessage: true, fastForward: false } });
			
	    if (save.total < dc) {
			await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid: target.actor.uuid });
			await wait(300);
			await HomebrewMacros.pushTarget(pusher, ttoken.object, squaresPushed);
		}

		// add damage bonus
		const diceMult = args[0].isCritical ? 4: 2;
		let damageType = game.i18n.localize("thunder");
		return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
