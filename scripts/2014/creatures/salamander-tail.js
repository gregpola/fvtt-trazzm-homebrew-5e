/*
	Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage plus 7 (2d6) fire
	damage, and the target is grappled (escape DC 14). Until this grapple ends, the target is restrained, the salamander
	can automatically hit the target with its tail, and the salamander can't make tail attacks against other targets.
*/
const version = "12.3.1";
const optionName = "Salamander Tail";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// make sure it was a hit
		let targetToken = workflow?.hitTargets?.first();
		if (targetToken) {
			let grappled = await HomebrewMacros.applyGrappled(token, targetToken, item, 14);
			if (grappled) {
				ChatMessage.create({
					content: `The salamander wraps it's tail around ${targetToken.name}, immobilizing them`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});
				actor.setFlag('midi-qol', flagName, targetToken.actor.uuid);
			}
		}
	}
	else if (args[0].macroPass === "preCheckHits") {
		let target = workflow.targets.first();
		if (target) {
			// check grappled
			let existingGrappled = target.actor.getRollData().effects.find(eff => eff.name === 'Grappled' && eff.origin === item.uuid);
			if (existingGrappled) {
				// auto hit
				let updatedRoll = await new Roll('100').evaluate({async: true});
				workflow.setAttackRoll(updatedRoll);
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
