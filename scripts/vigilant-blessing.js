/*
	The night has taught you to be vigilant. As an action, you give one creature you touch (including possibly yourself) advantage on the next initiative roll the creature makes. This benefit ends immediately after the roll or if you use this feature again.
*/
const version = "10.0.0";
const optionName = "Vigilant Blessing";
const flagName = "vigilant-blessing-actor";
	
try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
			
	if (args[0].macroPass === "postActiveEffects") {
		// check for existing blessing and remove it
		const lastBlessedId = actor.getFlag("midi-qol", flagName);
		if (lastBlessedId) {
			const lastBlessed = await fromUuid(lastBlessedId);
			
			if (lastBlessed) {
				let effect = lastBlessed.effects?.find(ef => ef.label === optionName && ef.origin === actor.uuid);
				if (effect) {
					await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: lastBlessed.uuid, effects: [effect.id] });
				}
			}
			
			await actor.unsetFlag("midi-qol", flagName);
		}

		// bless the new target
		let target = lastArg.targets[0];
		await actor.setFlag("midi-qol", flagName, target.actor.uuid);
		
		const effectData = {
			label: optionName,
			icon: "icons/sundries/gaming/dice-runed-brown.webp",
			origin: actor.uuid,
			changes: [
				{
					key: 'flags.dnd5e.initiativeAdv',
					mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					value: '1',
					priority: 20
				}
			],
			flags: {
				dae: {
					selfTarget: false,
					stackable: "none",
					durationExpression: "",
					macroRepeat: "none",
					specialDuration: ["isInitiative"],
					transfer: false
				}
			},
			disabled: false
		};
		
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
