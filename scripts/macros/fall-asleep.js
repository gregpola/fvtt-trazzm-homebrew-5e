const version = "11.0";
const optionName = "Banish";
const mutationFlag = "banished";
const flagName = "banished-effects-disabled";

for (let tok of canvas.tokens.controlled) {
    let tuuid = tok.actor.uuid;
    const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Unconscious', tuuid);
    if (!hasEffectApplied) {
        await game.dfreds.effectInterface.addEffect({ effectName: 'Unconscious', uuid: tuuid });
    }
}
