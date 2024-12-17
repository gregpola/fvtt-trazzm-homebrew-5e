const version = "12.3.0";
const optionName = "Feinting Attack";

try {
	let targetToken = workflow.targets.first();

	if (args[0].macroPass === "preAttackRoll" && targetToken) {
		const actorEffect = actor.effects.find(i=>i.name === optionName);
		const targetEffect = HomebrewHelpers.findEffect(targetToken.actor, optionName);
		if (actorEffect && targetEffect) {
			workflow.advantage = "true";
		}
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
