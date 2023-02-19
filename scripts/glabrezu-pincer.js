const version = "10.0.0";
const optionName = "Glabrezu Pincer";

try {
	const lastArg = args[args.length - 1];
	
	if (args[0].macroPass === "postActiveEffects") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetToken = canvas.tokens.get(lastArg.hitTargets[0].object.id);
		
		// check the target's size, must be Large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (["tiny","sm","med","lg"].includes(tsize)) {
			if(!game.dfreds.effectInterface.hasEffectApplied('Grappled', targetToken.actor.uuid)) {
				await game.dfreds.effectInterface.addEffect({ effectName: 'Grappled', uuid: targetToken.actor.uuid});
				ChatMessage.create({'content': `${actor.name} grabs ahold of ${targetToken.name}`})
			}
		}		
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
