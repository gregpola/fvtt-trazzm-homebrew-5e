/*
    For the duration, no sound can be created within or pass through a 20-foot-radius Sphere centered on a point you
    choose within range. Any creature or object entirely inside the Sphere has Immunity to Thunder damage, and creatures
    have the &Reference[deafened apply=false] condition while entirely inside it. Casting a spell that includes a Verbal
    component is impossible there.
*/
const optionName = "Silence";
const version = "13.5.0";
const effectName = "Silence - Thunder Immunity";

try {
    // this just applies/removes thunder immunity
    // Token enters macro
    let targetToken = event.data.token;
    if (targetToken) {
        const sourceItemId = region.flags['region-attacher'].itemUuid;

        // look for even type
        if (event.name === "tokenEnter") {
            let effectData = {
                name: effectName,
                icon: "systems/dnd5e/icons/svg/damage/thunder.svg",
                origin: sourceItemId,
                description: '<p>The target has immunity tlo thunder damage while within the area of silence.</p>',
                statuses: [],
                changes: [
                    {
                        key: 'system.traits.di.value',
                        value: 'thunder',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        priority: 20
                    }
                ],
                flags: {
                    dae: {
                        specialDuration: ['shortRest', 'combatEnd'],
                        stackable: 'noneName'
                    }
                }
            };
            await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
        }
        else if (event.name === "tokenExit") {
            const effect = HomebrewHelpers.findEffect(targetToken.actor, effectName, sourceItemId);
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
