const version = "11.0";
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

		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		// find nearby enemies
		const enemies = MidiQOL.findNearby(-1, token, 10);
		if (enemies.length < 1) {
			return ui.notifications.error(`${optionName} - no enemies within range`);
		}

		// apply the effect
		const effectData = {
			name: "Draconic Cry",
			icon: "icons/creatures/abilities/dragon-breath-purple.webp",
			origin: workflow.item.uuid,
			changes: [
				{
					key: "flags.midi-qol.grants.advantage.attack.all",
					mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					value: "1",
					priority: 20
				}
			],
			flags: {
				dae: {
					selfTarget: false,
					stackable: "none",
					durationExpression: "",
					macroRepeat: "none",
					specialDuration: [
						"turnStartSource"
					],
					transfer: false
				}
			},
			disabled: false,
			duration: {
				rounds: 1,
				startTime: null
			},
			
		};

		for (let ttoken of enemies) {
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: ttoken.actor.uuid, effects: [effectData] });
		}

	}
	
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
