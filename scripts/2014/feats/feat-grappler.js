/*
	You’ve developed the skills necessary to hold your own in close-quarters grappling. You gain the following benefits:

	- You have advantage on attack rolls against a creature you are grappling.
	- You can use your action to try to pin a creature Grappled by you. To do so, make another grapple check. If you
	succeed, you and the creature are both Restrained until the grapple ends.
 */
const version = "12.3.0";
const optionName = "Grappler";

try {
	let defender = workflow.targets.first();
	const hasGrappled = defender.actor.effects.find( eff => eff.name === 'Grappled' && eff.origin === actor.uuid);

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
			// Run the opposed skill check
			const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
			let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'skill:ath'},
				{token: defender, request:`skill:${skilltoberolled}`},
				{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${token.name}'s pin attempt`});

			let i=0;
			while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
				await new Promise(resolve => setTimeout(resolve, 500));
				i++;
			}

			let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
			if (result === "won" || result === "tied") {
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

async function success(token, targetToken, item) {
	await HomebrewMacros.applyRestrained(token, targetToken, item, 'opposed');
}
