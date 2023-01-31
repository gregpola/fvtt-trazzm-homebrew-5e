const version = "10.0.0";
const optionName = "Grappler";
const lastArg = args[args.length - 1];

try {
	let workflow = await MidiQOL.Workflow.getWorkflow(lastArg.uuid);
	let grappler = canvas.tokens.get(lastArg.tokenId);
	let defender = Array.from(game.user.targets)[0];
	const hasGrappled = await game.dfreds.effectInterface.hasEffectApplied('Grappled', defender.actor.uuid);

	if (args[0].macroPass === "preAttackRoll") {
		if (hasGrappled) {
			workflow.advantage = "true";
		}
	}
	else {
		// make sure the target is already grappled
		if (!hasGrappled) {
			ChatMessage.create({'content': `Unable to attempt to pin ${defender.name}, is not grappled!`})
		}
		else {
			ChatMessage.create({'content': `${grappler.name} tries to pin ${defender.name}!`})
			let tactorRoll = await grappler.actor.rollSkill("ath");
			let skill = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
			let tokenRoll = await defender.actor.rollSkill(skill);
			await game.dice3d?.showForRoll(tokenRoll);
			
			if (tactorRoll.total >= tokenRoll.total) {
				ChatMessage.create({'content': `${grappler.name} pins ${defender.name}!`});
				const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Restrained', defender.actor.uuid);
				if (!hasEffectApplied) {
					const uuid = defender.actor.uuid;
					await game.dfreds?.effectInterface.addEffect({ effectName: 'Restrained', uuid });
				}
				
				const hasEffectAppliedGrappler = await game.dfreds.effectInterface.hasEffectApplied('Restrained', grappler.actor.uuid);
				if (!hasEffectAppliedGrappler) {
					await game.dfreds?.effectInterface.addEffect({ effectName: 'Restrained', uuid: grappler.actor.uuid });
				}
			}
			else {
				ChatMessage.create({'content': `${grappler.name} fails to pin ${defender.name}`});
			}
			
		}
	}
	
} catch (err) {
    console.error(`Grappler feat ${version}`, err);
}
