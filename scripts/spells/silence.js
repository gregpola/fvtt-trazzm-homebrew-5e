/*
    For the duration, no sound can be created within or pass through a 20-foot-radius Sphere centered on a point you
    choose within range. Any creature or object entirely inside the Sphere has Immunity to Thunder damage, and creatures
    have the &Reference[deafened apply=false] condition while entirely inside it. Casting a spell that includes a Verbal
    component is impossible there.
*/
const optionName = "Silence";
const version = "13.5.1";
const effectName = "Silenced";

try {
    // this just applies/removes thunder immunity
    // Token enters macro
    let targetToken = event.data.token;
    if (targetToken) {
        const sourceItemId = region.flags['region-attacher'].itemUuid;
        const sourceItem = await fromUuid(sourceItemId);
        let silencedEffect;

        if (sourceItem) {
            silencedEffect = sourceItem.effects.find(e => e.name === effectName);
        }

        // look for even type
        if (event.name === "tokenEnter" && silencedEffect) {
            await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [silencedEffect]});
        }
        else if (event.name === "tokenExit") {
            const effect = await HomebrewEffects.findEffectBySourceActor(targetToken.actor, effectName, sourceItem.parent);
            if (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: targetToken.actor.uuid,
                    effects: [effect.id]
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
