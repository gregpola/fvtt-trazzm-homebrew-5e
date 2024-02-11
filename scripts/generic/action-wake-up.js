const version = "11.0";
const optionName = "Wake Up";

try {
    const targetToken = workflow.targets.first();

    // validate that the target can be stabilized
    const currentHP = targetToken.actor?.system.attributes.hp.value ?? 1;

    if (currentHP > 0) {
        const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Unconscious', targetToken.actor.uuid);
        if (!hasEffectApplied) {
            await game.dfreds.effectInterface.removeEffect({effectName: 'Unconscious', uuid:targetToken.actor.uuid});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
