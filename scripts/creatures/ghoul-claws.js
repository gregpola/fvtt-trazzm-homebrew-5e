/*
	 If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be
	 paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect
	 on itself on a success.
*/
const version = "11.0";
const optionName = "Ghoul Claws";
const saveDC = 10;

try {
	let targetToken = workflow?.hitTargets?.first();
	if ((args[0].macroPass === "postActiveEffects") && targetToken) {
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
		await game.MonksTokenBar.requestRoll([{token: targetToken}], {
			request:[{"type": "save", "key": "con"}],
			dc:saveDC, showdc:true, silent:true, fastForward:false,
			flavor:`${optionName}`,
			rollMode:'roll',
			callback: async (result) => {
				console.log(result);
				for (let tr of result.tokenresults) {
					if (!tr.passed) {
						await applyParalyzedEffect(targetToken);
					}
				}
			}
		});
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyParalyzedEffect(targetToken) {
	const effectData = {
		name: `${optionName}`,
		icon: item.img,
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