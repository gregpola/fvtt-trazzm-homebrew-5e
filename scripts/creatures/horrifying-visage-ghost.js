/*
    Each non-undead creature within 60 feet of the ghost that can see it must succeed on a DC 13 Wisdom saving throw or
    be frightened for 1 minute. If the save fails by 5 or more, the target also ages 1d4 × 10 years. A frightened target
    can repeat the saving throw at the end of each of its turns, ending the frightened condition on itself on a success.
    If a target's saving throw is successful or the effect ends for it, the target is immune to this ghost's Horrifying
    Visage for the next 24 hours. The aging effect can be reversed with a greater restoration spell, but only within 24
    hours of it occurring.
 */
const version = "12.3.0";
const optionName = "Horrifying Visage";
const immunityEffect = "ghost-visage-immunity";
let saveDC = macroItem.system.save.dc;

try {
    if (args[0].macroPass === "postActiveEffects") {
        // Apply Frightened effect (overtime)
        for (let target of workflow.failedSaves) {
            if (!hasImmunity(target.actor, macroItem.uuid)) {
                let overtimeValue = `turn=end, label=Frightened, saveDC=${saveDC}, saveAbility=wis`;
                await HomebrewEffects.applyFrightenedEffect(target.actor, macroItem.uuid, undefined, 60, overtimeValue);

                // check for aging
                // compare the save result to the DC to determine if they should be aged
                let targetResult = workflow.saveResults.find(r => r.data.actorId === target.actor.id)?.total;
                if (targetResult && (targetResult < (saveDC - 4))) {
                    let ageRoll = await new Roll("1d4").roll({async: true});
                    let ageYears = ageRoll.result * 10;

                    ChatMessage.create({
                        content: `${target.actor.name} is aged ${ageYears} years!`,
                        speaker: ChatMessage.getSpeaker({ actor: actor })});
                }
            }
        }

        // apply immunity
        for (let target of workflow.saves) {
            if (!hasImmunity(target.actor, actor.uuid)) {
                await addImmunity(target.actor);
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
    return hasImmunity || (targetActor === sourceActor);
}
