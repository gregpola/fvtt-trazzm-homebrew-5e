/*
	You have advantage on an attack roll against a creature if at least one of your allies is within 5 feet of the creature and the ally isn’t incapacitated.
*/
const version = "10.0.0";
const optionName = "Pack Tactics";

try {
	const lastArg = args[args.length - 1];
	
	if (args[0].macroPass === "preAttackRoll") {
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		if(!actorToken || lastArg.targets.length < 1)
			return;
		
		const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);
		const creatures = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, targetToken, 5);
		const validCreatures = arrayRemove(creatures, actorToken);
		
		if (validCreatures.length === 0 || validCreatures.filter(t=>t.actor.effects.find(i=>i.label === "Incapacitated")).length === validCreatures.length)
			return;
		else
			setProperty(lastArg.workflow, 'advantage', true);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}
