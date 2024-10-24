/*
	Melee Weapon Attack: +7 to hit, reach 20 ft., one creature. Hit: The target takes 11 (2d6 + 5) bludgeoning damage, 
	and it is Grappled (escape DC 14). Until this grapple ends, the target is Restrained, and it takes 21 (6d6) poison 
	damage at the start of each of its turns. The vine can constrict only one target at a time.
*/
const version = "12.3.1";
const optionName = "Constrict";
const flagName = "assassin-vine-grappled";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	let targetToken = workflow?.hitTargets?.first();
	if ((args[0].macroPass === "postActiveEffects") && targetToken) {
		// make sure the vine isn't already grappling someone else
		const grappleFlag = actor.getFlag(_flagGroup, flagName);
		if (!grappleFlag) {
			// grapple the target
			let overtimeValue = "turn=start, label=Assassin Vine Constrict, damageRoll=6d6, damageType=poison";
			let grappled = await HomebrewMacros.applyGrappled(token, targetToken, item, 14, flagName, overtimeValue);
			if (grappled) {
				ChatMessage.create({
					content: `The vines entwine ${targetToken.name}`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});			
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
