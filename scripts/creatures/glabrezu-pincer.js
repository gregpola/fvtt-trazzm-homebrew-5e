const version = "12.3.1";
const optionName = "Glabrezu Pincer";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let targetToken = workflow?.hitTargets?.first();

		if (targetToken) {
			// check the target's size, must be Large or smaller
			const tsize = targetToken.actor.system.traits.size;
			if (["tiny","sm","med","lg"].includes(tsize)) {
				await HomebrewMacros.applyGrappled(token, targetToken, item, 15);
				ChatMessage.create({'content': `${actor.name} grabs hold of ${targetToken.name}`})
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
