const version = "12.3.0";
const optionName = "Draining Attack";

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
