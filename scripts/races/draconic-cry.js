const version = "11.1";
const optionName = "Draconic Cry";

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for nearby enemies
		const enemies = MidiQOL.findNearby(-1, token, 10);
		if (enemies.length < 1) {
			ChatMessage.create({
				content: `${optionName} failed - no enemies within range`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
			return false;
		}
	}
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
