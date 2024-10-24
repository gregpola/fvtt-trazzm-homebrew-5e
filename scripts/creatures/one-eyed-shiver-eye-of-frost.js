/*
	The one-eyed shiver casts ray of frost from its missing eye. If it hits, the target is also restrained. A target restrained in this way can end the condition by using an action, succeeding on a DC 13 Strength check.
*/
const version = "10.1";
const optionName = "Eye of Frost";

try {
	let targetToken = workflow?.hitTargets?.first();
	if ((args[0].macroPass === "postActiveEffects") && targetToken) {
		let restrained = await HomebrewMacros.applyRestrained(token, targetToken, item, 13, "str");
		if (restrained) {
			ChatMessage.create({
				content: `${targetToken.name} is encased in ice`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});			
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
