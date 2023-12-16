/*
	As you call out words of restoration, up to six creatures of your choice that you can see within range regain hit
	points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the healing increases by 1d4
	for each slot level above 3rd.
*/
const version = "11.0";
const optionName = "Mass Healing Word";

try {
	if (args[0].macroPass === "preambleComplete") {
		// check the target count
		if (workflow.targets.size > 6) {
			ui.notifications.error(`${optionName}: ${version} - too many targets selected`);
			return false;
		}

		// filter out ineligible targets
		let eligibleTargets = [];
		for (let t of workflow.targets) {
			if (!["construct", "undead"].includes(t.actor.system.details?.type?.value)) {
				eligibleTargets.push(t.id);
			}
		}

		if (eligibleTargets.length !== workflow.targets.size) {
			game.user.updateTokenTargets(eligibleTargets);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
