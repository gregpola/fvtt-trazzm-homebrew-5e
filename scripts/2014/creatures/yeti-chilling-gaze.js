/*
    The yeti targets one creature it can see within 30 feet of it. If the target can see the yeti, the target must
    succeed on a DC 13 Constitution saving throw against this magic or take 10 (3d6) cold damage and then be paralyzed
    for 1 minute, unless it is immune to cold damage. The target can repeat the saving throw at the end of each of its
    turns, ending the effect on itself on a success. If the target’s saving throw is successful, or if the effect ends
    on it, the target is immune to the Chilling Gaze of all yetis (but not abominable yetis) for 1 hour.
*/
const version = "12.3.0";
const optionName = "Chilling Gaze";
const immunityEffect = "chilling-gaze-immunity";
const saveDC = 13;

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow?.failedSaves?.first();
        if (targetToken && !hasImmunity(targetToken.actor, item.actor)) {
            // check for cold immunity
            if (!targetToken.actor.system.traits.di.value.has('cold')) {
                await HomebrewEffects.applyParalyzedEffect(targetToken.actor, item.uuid, undefined, 60, `turn=end, label=Paralyzed, saveDC=${saveDC}, saveAbility=con`);
            }
        }
        else {
            targetToken = workflow.saves.first();
            if (targetToken) {
                await addImmunity(targetToken.actor);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function addImmunity(targetActor) {
    const effectData = {
        name: immunityEffect,
        icon: "icons/magic/perception/eye-ringed-glow-angry-large-teal.webp",
        origin: macroItem.uuid,
        duration: {seconds: 3600},
        changes: [],
        disabled: false,
        flags: {
            dae: {
                stackable: 'noneNameOnly',
            }
        }
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}

function hasImmunity(targetActor) {
    const hasImmunity = targetActor.effects?.find(ef => ef.name === immunityEffect && ef.origin === macroItem.uuid);
    const hasColdImmunity = targetActor.system.traits?.di?.value?.has('cold');
    return hasImmunity || hasColdImmunity;
}
