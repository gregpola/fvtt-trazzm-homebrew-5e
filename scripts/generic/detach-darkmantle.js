const version = "12.3.0";
const optionName = "Detach Darkmantle";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "darkmantle-crush";

try {
    let stuckEffect = HomebrewHelpers.findEffect(actor, 'Darkmantle Attached');
    if (stuckEffect) {
        let checkDC = 13;
        let checkType = 'str';
        let tokenId;
        let flag = stuckEffect.getFlag(_flagGroup, flagName);
        if (flag) {
            checkDC = flag.checkdc;
            checkType = flag.checktype;
            tokenId = flag.tokenId;
        }

        let skillRoll = await actor.rollAbilityTest(checkType, {targetValue: checkDC});
        if (skillRoll.total >= checkDC) {
            ChatMessage.create({
                content: `${actor.name} detaches the Darkmantle`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });

            let tok = canvas.tokens.get(tokenId);
            await tokenAttacher.detachElementFromToken(tok, token, true);

            // get all the effects to remove
            await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: actor.uuid, effects: [stuckEffect.id]});

        } else {
            ChatMessage.create({
                content: `${actor.name} failed to detach`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
