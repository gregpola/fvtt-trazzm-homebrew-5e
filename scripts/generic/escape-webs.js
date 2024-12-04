const version = "12.3.0";
const optionName = "Escape Webs";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "spelldc";

try {
    let stuckEffect = HomebrewHelpers.findEffect(actor, 'Stuck In Webs');
    if (stuckEffect) {
        let checkDC = 12;
        let flag = stuckEffect.getFlag(_flagGroup, flagName);
        if (flag) {
            checkDC = flag;
        }

        let skillRoll = await actor.rollAbilityTest('str', {targetValue: checkDC});
        if (skillRoll.total >= checkDC) {
            ChatMessage.create({'content': `${actor.name} breaks free of the webs`});
            await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: actor.uuid, effects: [stuckEffect.id]});
        } else {
            ChatMessage.create({'content': `${actor.name} failed to break free`});
        }
    }
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
