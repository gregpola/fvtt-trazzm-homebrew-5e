const version = "11.0";
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

    await warpgate.revert(tok.document, mutationFlag);
    await tok.document.update({ "hidden": false });
    await ChatMessage.create({ content: `${tok.name} has returned`});
}