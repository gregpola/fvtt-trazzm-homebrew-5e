/*
	Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage plus 7 (2d6) fire
	damage, and the target is grappled (escape DC 14). Until this grapple ends, the target is restrained, the salamander
	can automatically hit the target with its tail, and the salamander can't make tail attacks against other targets.
*/
const version = "11.0";
const optionName = "Salamander Tail";
const flagName = "salamander-tail-grappled";

try {
	// Check the grappling state of the Salamander
	const grappleFlag = actor.getFlag('midi-qol', flagName);

	if (args[0].macroPass === "postActiveEffects" && !grappleFlag) {
		// make sure it was a hit
		let targetToken = workflow?.hitTargets?.first();
		if (targetToken) {
			let grappled = await HomebrewMacros.applyGrappled(token, targetToken, 14, flagName, null);
			if (grappled) {
				ChatMessage.create({
					content: `The salamander wraps it's tail around ${targetToken.name}, immobilizing them`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});
				actor.setFlag('midi-qol', flagName, targetToken.actor.uuid);
			}
		}
	}
	else if (args[0].macroPass === "preCheckHits" && grappleFlag) {
		let target = workflow.targets.first();
		if (target && target.actor.uuid === grappleFlag) {
			// auto hit
			let updatedRoll = await new Roll('100').evaluate({async: true});
			workflow.setAttackRoll(updatedRoll);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
