		
		// Add an effect to the actor to handle on/off
		const effectData = {
			label: `${optionName}`,
			icon: "icons/creatures/magical/spirit-fear-energy-pink.webp",
			changes: [
				{
					"key": "macro.itemMacro",
					"mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					"value": "ItemMacro.Summon Wildfire Spirit",
					"priority": "20"
				}
			],
			disabled: false,
			duration: {
				"startTime": game.time.worldTime,
				"seconds": 3600
			},
			origin: actor.uuid,
			transfer: false
		}
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
