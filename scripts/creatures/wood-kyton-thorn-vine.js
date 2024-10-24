/*
	Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) slashing damage. The target is Grappled (escape DC 14) if the kyton isn't already grappling a creature. Until this grapple ends, the target is Restrained and takes 7 (2d6) piercing damage at the start of each of its turns.
*/
const version = "12.3.0";
const optionName = "Thorn Vine";
const flagName = "thorn-vine-grappled";

try {
	let targetToken = workflow?.hitTargets?.first();
	if ((args[0].macroPass === "postActiveEffects") && targetToken) {
		// make sure the Kyton is not already grappling someone
		const grappleFlag = actor.getFlag("midi-qol", flagName);
		if (!grappleFlag) {
			actor.setFlag("midi-qol", flagName, true);
			let grappled = await HomebrewMacros.applyGrappled(token, targetToken, item, 14, flagName, "turn=start, damageRoll=2d6, damageType=piercing, label=Grappled, saveRemove=false", true);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
