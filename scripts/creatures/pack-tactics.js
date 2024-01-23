/*
	You have advantage on an attack roll against a creature if at least one of your allies is within 5 feet of the creature and the ally isn’t incapacitated.
*/
const version = "11.0";
const optionName = "Pack Tactics";

try {
	if (args[0].macroPass === "preAttackRoll") {
		const targetToken = workflow.targets.first();
		const creatures = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, targetToken, 5);
		const validCreatures = arrayRemove(creatures, token);

		if (validCreatures.length > 0) {
			const eligibleAllies =
		}
		
		if (validCreatures.length === 0 || validCreatures.filter(t=>t.actor.effects.find(i=>i.name === "Incapacitated")).length === validCreatures.length)
			return;
		else
			workflow.advantage = true;
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}
