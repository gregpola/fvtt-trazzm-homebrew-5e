const version = "12.3.0";
const optionName = "Fusillade of Drow Poison Darts";
const saveDC = 13;

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			if (workflow.failedSaves.first()) {
				await HomebrewEffects.applyPoisonedEffect(targetToken.actor, item, undefined, 3600);

				if (workflow.saveResults[0].total <= (saveDC - 5)) {
					await HomebrewEffects.applySleepingEffect(targetToken.actor, item, ['isDamaged'], 3600);
				}
			}
		}
	}
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
