/*
	Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 8 (1d6 + 5) piercing damage plus 18 (4d8) necrotic damage.
	The target’s hit point maximum is reduced by an amount equal to the necrotic damage taken. This reduction lasts until
	the target finishes a long rest. The target dies if its hit point maximum is reduced to 0.
*/
const version = "12.3.0";
const optionName = "Death Lance";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken && workflow.damageDetail) {
			const nectroticDamage = workflow.damageDetail.find(i => i.type === "necrotic");

			if (nectroticDamage && (nectroticDamage.damage > 0)) {
				await HomebrewMacros.applyLifeDrainEffect(actor, targetToken.actor, nectroticDamage.damage);
				ChatMessage.create({
					content: `${targetToken.actor.name} is drained ${nectroticDamage.damage} max hp`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
