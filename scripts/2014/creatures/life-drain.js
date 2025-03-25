/*
	 The target must succeed on a Constitution saving throw or its hit point maximum is reduced by an amount equal
	 to the damage taken. This reduction lasts until the creature finishes a long rest. The target dies if this effect
	 reduces its hit point maximum to 0.
*/
const version = "12.3.0";
const optionName = "Life Drain";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.failedSaves.first();
        if (target && workflow.damageDetail) {
            const nectroticDamage = workflow.damageDetail.find(i => i.type === "necrotic");

            if (nectroticDamage && (nectroticDamage.damage > 0)) {
                await HomebrewMacros.applyLifeDrainEffect(actor, target.actor, nectroticDamage.damage);
                ChatMessage.create({
                    content: `${target.name} is drained ${nectroticDamage.damage} Max HP`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
