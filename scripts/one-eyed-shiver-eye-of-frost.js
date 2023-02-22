/*
	The one-eyed shiver casts ray of frost from its missing eye. If it hits, the target is also restrained. A target restrained in this way can end the condition by using an action, succeeding on a DC 13 Strength check.
*/
const version = "10.0.0";
const optionName = "Eye of Frost";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if ((args[0].macroPass === "postActiveEffects") && (lastArg.hitTargets.length > 0)) {
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);

		let restrained = await HomebrewMacros.applyRestrained(actor, targetToken.document, 13, "str", "", "");
		if (restrained) {
			ChatMessage.create({
				content: `${targetToken.name} is encased in ice`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});			
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
