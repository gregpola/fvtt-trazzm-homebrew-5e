const version = "10.0.1";
const optionName = "Draconic Cry";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
	if (args[0].macroPass === "postActiveEffects") {
		// find nearby enemies
		const enemies = MidiQOL.findNearby(-1, token, 10);
		
		if (enemies.length === 0) {
			return ui.notifications.error(`${optionName} - no enemies within range`);
		}

		// apply the effect
		const effectData = {
			label: "Draconic Cry",
			icon: "icons/creatures/abilities/dragon-breath-purple.webp",
			origin: actor.id,
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
						"turnEndSource"
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
