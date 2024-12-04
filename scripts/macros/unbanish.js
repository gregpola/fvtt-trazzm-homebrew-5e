const version = "12.3.0";
const optionName = "Unbanish";
const mutationFlag = "banished";
const flagName = "banished-effects-disabled";

for(let tok of canvas.tokens.controlled) {
    const flag = tok.actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
    if (flag) {
        await tok.actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);

        for (let effectId of flag) {
            let effect = tok.actor.effects.find(e => e.id === effectId);
            if (effect) {
                await effect.update({disabled: false});
            }
        }
    }

    let banishedEffect = tok.actor.effects.find(eff => eff.name === "Banished");
    if (banishedEffect) {
        banishedEffect.delete();
    }

    await tok.document.update({ "hidden": false });
    await ChatMessage.create({ content: `${tok.name} has returned`});
}