const version = "10.1";
const optionName = "Glabrezu Pincer";
const flagName = "glabrezu-grappled";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let targetToken = workflow?.hitTargets?.first();

		if (targetToken) {
			// check the target's size, must be Large or smaller
			const tsize = targetToken.actor.system.traits.size;
			if (["tiny","sm","med","lg"].includes(tsize)) {
				if(!game.dfreds.effectInterface.hasEffectApplied('Grappled', targetToken.actor.uuid)) {
					await HomebrewMacros.applyGrappled(token, targetToken, 15, flagName, null, null);
					ChatMessage.create({'content': `${actor.name} grabs hold of ${targetToken.name}`})
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
