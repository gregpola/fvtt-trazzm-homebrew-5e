/*
	Melee Weapon Attack: +5 to hit, reach 10 ft., one creature. Hit: 13 (3d6 + 3) bludgeoning damage. If the target is
	Medium or smaller, it is grappled (escape DC 13) and pulled 5 feet toward the poison weird. Until this grapple ends,
	the target is restrained, the poison weird tries to drown it, and the poison weird can’t constrict another target.
*/
const version = "10.1";
const optionName = "Constrict";
const flagName = "poison-weird-grappled";

try {
	let targetToken = workflow?.hitTargets?.first();
	if ((args[0].macroPass === "postActiveEffects") && targetToken) {
		// check the size
		const tsize = targetToken.actor.system.traits.size;
		if (!["tiny","sm","med"].includes(tsize)) {
			console.log(`${optionName} - target is too large to grapple`);
		}
		else {
			await HomebrewMacros.applyGrappled(token, targetToken, 13, flagName, "turn=start, damageRoll=3d6, damageType=poison, label=Constricted", true);
			await HomebrewMacros.pullTarget(token, targetToken, 1);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
