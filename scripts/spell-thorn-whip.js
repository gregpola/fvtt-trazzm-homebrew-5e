/*
	You create a long, vine-like whip covered in thorns that lashes out at your command toward a creature in range.
	Make a melee spell attack against the target. If the attack hits, the creature takes 1d6 piercing damage, and if the
	creature is Large or smaller, you pull the creature up to 10 feet closer to you.

	The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).
*/
const version = "10.2";
const optionName = "Thorn Whip";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects" && lastArg.hitTargets.length > 0) {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
			
		// check the target's size, must be Large or smaller
		const tsize = targetActor.system.traits.size;
		if (["tiny","sm","med","lg"].includes(tsize)) {
			// ask the player how far they want to pull the target
			new Dialog({
				title: `${optionName} - Pull`,
				content: `How far do you want to pull '${targetActor.name}'?`,
				buttons: {
					A: { label: "10 feet", callback: async () => {
							await HomebrewMacros.pullTarget(actorToken, targetToken, 2);
						} },
					B: { label: "5 feet", callback: async () => {
							await HomebrewMacros.pullTarget(actorToken, targetToken, 1);
						} },
					C: { label: "0", callback: async () => {
							ChatMessage.create({'content': `${actor.name} chose to not pull ${targetActor.name}`})
						} },
				}
			}).render(true);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
