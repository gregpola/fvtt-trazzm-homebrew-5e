/*
	 If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be
	 paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect
	 on itself on a success.
*/
const version = "12.3.0";
const optionName = "Ghoul Claws";
const saveDC = 10;

try {
	let targetToken = workflow?.failedSaves?.first();
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

		await HomebrewEffects.applyParalyzedEffect(targetToken.actor, item.uuid, undefined, 60, `turn=end, label=Paralyzed, saveDC=${saveDC}, saveAbility=con`);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
