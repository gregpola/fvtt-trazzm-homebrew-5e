/*
	When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can’t use this feature again until you finish a long rest.
	
	Orcish Fury: Immediately after you use your Relentless Endurance trait, you can use your reaction to make one weapon attack.
*/
const version = "10.0.0";
const optionName = "Relentless Endurance";

try {
	if (args[0].macroPass === "postActiveEffects") {	
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		// check if they have Orcish Fury
		let featureItem = actor.items.getName("Orcish Fury");
		if (featureItem) {
			ChatMessage.create({
				content: `${actor.name} can use your reaction to make one weapon attack. (Orcish Fury)`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
