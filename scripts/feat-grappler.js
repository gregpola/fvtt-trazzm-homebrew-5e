const version = "10.1";
const optionName = "Grappler";

try {
	let defender = workflow.targets.first();
	const hasGrappled = defender.actor.effects.find( eff => eff.label === 'Grappled' && eff.origin === actor.uuid);

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
			ChatMessage.create({'content': `${actor.name} tries to pin ${defender.name}!`})
			let tactorRoll = await actor.rollSkill("ath");
			let skill = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
			let tokenRoll = await defender.actor.rollSkill(skill);
			await game.dice3d?.showForRoll(tokenRoll);
			
			if (tactorRoll.total >= tokenRoll.total) {
				ChatMessage.create({'content': `${grappactorler.name} pins ${defender.name}!`});
				const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Restrained', defender.actor.uuid);
				if (!hasEffectApplied) {
					await game.dfreds.effectInterface.addEffect({
						'effectName': 'Restrained',
						'uuid': defender.actor.uuid,
						'origin': actor.uuid,
						'overlay': false
					});
				}
				
				const hasEffectAppliedGrappler = await game.dfreds.effectInterface.hasEffectApplied('Restrained', actor.uuid);
				if (!hasEffectAppliedGrappler) {
					await game.dfreds.effectInterface.addEffect({
						'effectName': 'Restrained',
						'uuid': actor.uuid,
						'origin': workflow.origin,
						'overlay': false
					});
				}
			}
			else {
				ChatMessage.create({'content': `${actor.name} fails to pin ${defender.name}`});
			}
		}
	}
	
} catch (err) {
    console.error(`Grappler feat ${version}`, err);
}
