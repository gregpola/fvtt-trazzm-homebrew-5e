/*
    A constellation of a life-giving goblet appears on you. Whenever you cast a spell using a spell slot that restores
    Hit Points to a creature, you or another creature within 30 feet of you can regain Hit Points equal to 1d8 plus your
    Wisdom modifier.
*/
const optionName = "Starry Form";
const version = "14.5.0";
const fullOfStarsName = "Full of Stars";
const twinklingFlightEffectName = "Twinkling Constellations Flight";
const archerActivityName = "Archer Luminous Arrow";

try {
    const fullOfStars = actor?.items.getName(fullOfStarsName);
    const twinklingConstellations = actor?.items.getName("Twinkling Constellations");

    if (args[0] === "on") {
        // activate dependent features
        if (fullOfStars) {
            let activity = fullOfStars.system.activities.getName('Use');
            if (activity) {
                await activity.use();
            }
        }

        if (twinklingConstellations) {
            const flightEffect = twinklingConstellations.effects.getName(twinklingFlightEffectName);
            if (flightEffect) {
                await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [flightEffect]});
            }
        }

        // Favorite the arrow activity
        if (macroActivity.name === "Archer") {
            const luminousArrowActivity = macroItem.system.activities.getName(archerActivityName);
            if (luminousArrowActivity) {
                await HomebrewHelpers.addFavoriteActivity(actor, luminousArrowActivity);
            }
        }

    }
    else if (args[0] === "off") {
        // deactivate dependent features
        await HomebrewEffects.removeEffectByName(actor, "Chalice Form");
        await HomebrewEffects.removeEffectByName(actor, "Dragon Form");
        await HomebrewEffects.removeEffectByName(actor, fullOfStarsName);
        await HomebrewEffects.removeEffectByName(actor, twinklingFlightEffectName);

        const luminousArrowActivity = macroItem.system.activities.getName(archerActivityName);
        if (luminousArrowActivity) {
            await HomebrewHelpers.removeFavoriteActivity(actor, luminousArrowActivity);
        }

    }
    else if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        if (rolledItem.type === "spell" && rolledActivity.healing !== undefined) {
            // make sure Chalice Form is active
            const chaliceForm = HomebrewEffects.findEffect(actor, "Chalice Form");
            if (chaliceForm) {
                const potentialTargets = await MidiQOL.findNearby([0, 1], token, 30, {canSee: true});
                if (potentialTargets.length > 0) {
                    const secondaryTarget = await HomebrewHelpers.pickTarget(potentialTargets, `${optionName} - select heal target:`)
                    if (secondaryTarget) {
                        let activity = await macroItem.system.activities.find(a => a.identifier === 'chalice-healing');
                        if (activity) {
                            const targetUuids = [secondaryTarget.document.uuid];
                            await MidiQOL.completeActivityUse(activity, {midiOptions: {targetUuids}});
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
