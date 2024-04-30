const version = "11.0";
const optionName = "Fusillade of Drow Poison Darts";
const saveDC = 13;

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			if (workflow.failedSaves.first()) {
				await game.dfreds.effectInterface.addEffect({ effectName: 'Poisoned', uuid: targetToken.actor.uuid });

				if (workflow.saveResults[0].total <= (saveDC - 5)) {
					await game.dfreds.effectInterface.addEffect({ effectName: 'Unconscious', uuid: targetToken.actor.uuid });
				}
			}
		}
	}
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
