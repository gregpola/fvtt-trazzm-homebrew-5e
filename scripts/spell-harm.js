/*
	You unleash a virulent disease on a creature that you can see within range. The target must make a Constitution saving throw. On a failed save, it takes 14d6 necrotic damage, or half as much damage on a successful save. The damage can't reduce the target's hit points below 1. If the target fails the saving throw, its hit point maximum is reduced for 1 hour by an amount equal to the necrotic damage it took. Any effect that removes a disease allows a creature's hit point maximum to return to normal before that time passes.
*/
const version = "10.0.0";
const optionName = "Harm";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const targetTokenDoc = lastArg.failedSaves.length > 0 ? lastArg.failedSaves[0] : undefined;
		
		if (targetTokenDoc) {
			// Apply max hp damage
			const nectroticDamage = lastArg.damageDetail.find(i => i.type === "necrotic");
			
			if (nectroticDamage.damage > 0) {		
				// apply hp max reduction
				let currentMax = targetTokenDoc.actor.system.attributes.hp.max;
				const newMax = Math.max(0, currentMax - nectroticDamage.damage);
				
				const updates = {
					actor: {
						"system.attributes.hp.max": newMax
					}
				}
				
				/* Mutate the actor */
				await warpgate.mutate(targetTokenDoc, updates);
				ChatMessage.create({
					content: `${targetTokenDoc.actor.name} is drained`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
