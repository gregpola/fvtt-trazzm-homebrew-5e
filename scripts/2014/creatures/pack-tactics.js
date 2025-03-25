/*
	You have advantage on an attack roll against a creature if at least one of your allies is within 5 feet of the creature and the ally isn’t incapacitated.
*/
const version = "11.0";
const optionName = "Pack Tactics";

try {
	if (args[0].macroPass === "preAttackRoll") {
		const targetToken = workflow.targets.first();
		const nearbyAllies = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, targetToken, 5);

		if (nearbyAllies.length > 0) {
			workflow.advantage = true;
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
