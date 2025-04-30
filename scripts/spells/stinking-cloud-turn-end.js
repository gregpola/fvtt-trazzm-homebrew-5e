/*
    You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily
    Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by Gust of
    Wind) disperses it.

    Each creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned
    condition until the end of the current turn. While Poisoned in this way, the creature can’t take an action or a
    Bonus Action.
 */
const version = "12.4.0";
const optionName = "Cloudkill";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const effectName = "Stinking Cloud Poisoned";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    // remove the poisoned effect
    const originActorUuid = region.flags['region-attacher'].actorUuid;

    let effect = targetToken.actor.getRollData().effects.find(eff => eff.name === effectName && eff.origin.startsWith(originActorUuid));
    if (effect) {
        await MidiQOL.socket().executeAsGM('removeEffects', {
            'actorUuid': targetToken.actor.uuid,
            'effects': [effect.id]
        });
    }
}
