/**
 * Any creature with an Intelligence of 4 or more that is within 30 feet of the dragon must succeed on a DC 16 Wisdom
 * saving throw or be charmed by it for 1 minute. A creature can repeat the saving throw at the end of each of its turns,
 * ending the effect on itself on a success.
 *
 * If a creature’s saving throw is successful or the effect ends for it, the creature is immune to the dragon’s Malevolent Presence for the next 24 hours.
 */
const optionName = "Malevolent Presence";
const version = "14.5.0";
const immunityEffect = "Malevolent Presence Immunity";

try {
    if (args[0].macroPass === "prePreambleComplete") {
        var changed = false;
        const newTargets = new Set();
        for (let targetToken of workflow.targets) {
            if (await hasImmunity(targetToken.actor, actor)) {
                changed = true;
            }
            else {
                newTargets.add(targetToken);
            }
        }

        if (changed) {
            await HomebrewHelpers.updateTargets(newTargets);
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        for (let successTarget of workflow.saves) {
            await addImmunity(successTarget);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function addImmunity(targetToken) {
    const targetUuids = [targetToken.document.uuid];
    const activity = macroItem.system.activities.getName("Apply Immunity");
    if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
}

async function hasImmunity(targetActor, sourceActor) {
    let intScore = targetActor.system.abilities.int.value ?? 4;
    const hasCharmedImmunity = targetActor.system.traits.di.value.has('charmed');

    var hasImmuneEffect = false;
    var allImmuneEffects = targetActor.effects?.filter(ef => ef.name === immunityEffect);
    for (let eff of allImmuneEffects) {
        var effectActor = await HomebrewEffects.getEffectSourceActor(targetActor, eff);
        if (effectActor === sourceActor) {
            hasImmuneEffect = true;
            break;
        }
    }

    return (intScore < 4) || hasImmuneEffect || hasCharmedImmunity;
}
