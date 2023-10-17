/*
	 If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.
*/
const version = "10.0.0";
const optionName = "Ghoul Claws";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if ((args[0].macroPass === "postActiveEffects") && (lastArg.hitTargets.length > 0)) {
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// check creature type
		let creatureType = targetToken.actor.system.details.type;
		if (creatureType) {
			if (creatureType.value && creatureType.value.toLowerCase() === "undead") {
				return;
			}
			else if (creatureType.value && creatureType.value.toLowerCase() === "humanoid" && creatureType.subtype && creatureType.subtype.toLowerCase() === "elf") {
				return;
			}
		}
		
		// roll save
		let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: 'Ghoul Claws', dc: 10});
		if (saveRoll.total < 10) {
			const effectData = {
				label: `${optionName}`,
				icon: lastArg.item.img,
				origin: actor.uuid,
				duration: {startTime: game.time.worldTime, seconds: 60},
				changes: [
					{
						key: `flags.midi-qol.OverTime`, 
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 
						value: `turn=end, label=Paralyzed, saveDC=10, saveAbility=con`, 
						priority: 20
					},
					{
						key: 'macro.CE',
						mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						value: "Paralyzed",
						priority: 21
					}
				],
				transfer: false,
				disabled: false
			};
			
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); });}
