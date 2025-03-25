/*
    Each non-undead creature within 60 feet of the banshee that can see her must succeed on a DC 13 Wisdom saving throw
    or be frightened for 1 minute. A frightened target can repeat the saving throw at the end of each of its turns, with
    disadvantage if the banshee is within line of sight, ending the effect on itself on a success. If a target’s
    saving throw is successful or the effect ends for it, the target is immune to the banshee’s Horrifying Visage for
    the next 24 hours.
 */
const version = "12.3.0";
const optionName = "Horrifying Visage";
const immunityEffect = "banshee-visage-immunity";
let saveDC = macroItem.system.save.dc;
const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;

try {
    if (args[0].macroPass === "postActiveEffects") {
        // Apply Frightened effect (overtime)
        for (let target of workflow.failedSaves) {
            if (!hasImmunity(target.actor, macroItem.uuid)) {
                await HomebrewEffects.applyFrightenedEffect(target.actor, macroItem.uuid);
            }
        }

        // apply immunity
        for (let target of workflow.saves) {
            if (!hasImmunity(target.actor, actor.uuid)) {
                await addImmunity(target.actor);
            }
        }
    }
    else if (args[0] === "each") {
        if (!hasImmunity(actor, macroItem.actor)) {
            // get the source token
            let effectItem = await fromUuid(lastArgValue.effectUuid);
            let sourceToken = fromUuidSync(effectItem.origin.substring(0, effectItem.origin.indexOf('.Actor.')));

            const disadvantageSave = await MidiQOL.canSee(token, sourceToken);
            let saveRoll = await actor.rollAbilitySave("wis", {flavor: saveFlavor, disadvantage: disadvantageSave});
            if (saveRoll.total >= saveDC) {
                await addImmunity(actor);
                await HomebrewEffects.removeEffectByNameAndOrigin(actor, optionName, macroItem.uuid)
                ChatMessage.create({
                    content: `${actor.name} is no longer terrified of ${sourceToken.name}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function addImmunity(targetActor) {
    const effectData = {
        name: immunityEffect,
        icon: "icons/magic/nature/root-vine-caduceus-healing.webp",
        origin: macroItem.uuid,
        duration: {startTime: game.time.worldTime, seconds: 86400},
        changes: [],
        disabled: false
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}

function hasImmunity(targetActor, sourceActor) {
    const hasImmunity = targetActor.effects?.find(ef => ef.name === immunityEffect && ef.origin === macroItem.uuid);
    const hasPoisonImmunity = actor.system.traits.di.value.has('poison');
    return hasImmunity || hasPoisonImmunity || (targetActor === sourceActor);
}
