/*
	Melee Weapon Attack: +5 to hit, reach 10 ft., one creature. Hit: 13 (3d6 + 3) bludgeoning damage. If the target is Medium or smaller, it is grappled (escape DC 13) and pulled 5 feet toward the poison weird. Until this grapple ends, the target is restrained, the poison weird tries to drown it, and the poison weird can’t constrict another target.
*/
const version = "10.0.0";
const optionName = "Constrict";
const flagName = "poison-weird-grappled";

try {
	const lastArg = args[args.length - 1];
	
	if ((args[0].macroPass === "postActiveEffects") && (lastArg.hitTargets.length > 0)) {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = await canvas.tokens.get(lastArg.tokenId);
		let target = lastArg.hitTargets[0];
		let targetToken = canvas.tokens.get(lastArg.hitTargets[0].object.id);
		
		// check the size
		const tsize = target.actor.system.traits.size;
		if (!["tiny","sm","med"].includes(tsize)) {
			console.log(`${optionName} - target is too large to grapple`);
		}
		else {
			// add restrained
			await HomebrewMacros.applyGrappled(actor, targetToken.document, 13, flagName, "turn=start, damageRoll=3d6, damageType=poison, label=Constricted", true);
			
			// pull target towards it
			await HomebrewMacros.pullTarget(actorToken, targetToken, 1);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
