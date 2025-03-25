/*
	This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected
	to this poison must succeed on a DC 13 Constitution saving throw or be Poisoned for 1 hour. If the saving throw fails
	by 5 or more, the creature is also Unconscious while poisoned in this way. The creature wakes up if it takes damage
	or if another creature takes an action to shake it awake.
*/
const version = "12.3.1";
const optionName = "Drow NPC Poison";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const saveDC = item.system.save.dc ?? 13;

		let index = 0;
		for (let targetToken of workflow.targets) {
			if (workflow.failedSaves.has(targetToken)) {
				let matchingSave = workflow.saveResults[index];
				if (matchingSave) {
					await HomebrewEffects.applyPoisonedEffect(targetToken.actor, item);

					if (matchingSave.total < (saveDC - 5)) {
						if (!targetToken.actor.hasConditionEffect("sleeping")) {
							await HomebrewEffects.applySleepingEffect(targetToken.actor, item);
							ChatMessage.create({
								content: `${targetToken.name} falls asleep`,
								speaker: ChatMessage.getSpeaker({actor: actor})
							});
						}
					}
				}
			}
			index++;
		}
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
