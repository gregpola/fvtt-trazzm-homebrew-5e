/*
	Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 8 (1d6 + 5) piercing damage plus 18 (4d8) necrotic damage.
	The target’s hit point maximum is reduced by an amount equal to the necrotic damage taken. This reduction lasts until
	the target finishes a long rest. The target dies if its hit point maximum is reduced to 0.
*/
const version = "10.0.1";
const optionName = "Arcane Eruption";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetTokenDoc = lastArg.hitTargets.length > 0 ? lastArg.hitTargets[0] : undefined;
		
		if (targetTokenDoc) {
			const tsize = targetTokenDoc.actor.system.traits.size;
			if (!["tiny","sm","med","lg"].includes(tsize)) {
				console.log(`${resourceName} - target is too large to push`);
				return;
			}
			await HomebrewMacros.pushTarget(actorToken, targetTokenDoc.object, 2);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
