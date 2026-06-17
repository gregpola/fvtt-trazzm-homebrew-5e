/*
    When you manifest the Emanation and as a Bonus Action on your subsequent turns, you can choose another creature you
    can see in the Emanation. The target must succeed on a Constitution saving throw against your spell save DC or take
    Cold damage and, if the creature is Large or smaller, be pushed up to 15 feet away from you. To determine this
    damage, roll a number of d6s equal to your Wisdom modifier (minimum of one die).
*/
const optionName = "Wrath of the Sea";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check for Stormborn
        const hasStormborn = actor.items.getName("Stormborn");
        if (hasStormborn) {
            let effectsToApply = [];
            for (let effect of hasStormborn.effects) {
                effectsToApply.push(effect);
            }

            if (effectsToApply.length > 0) {
                await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: effectsToApply});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
