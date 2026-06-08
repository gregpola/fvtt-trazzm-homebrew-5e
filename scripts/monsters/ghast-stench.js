/*
    Constitution Saving Throw: DC 10, any creature that starts its turn in a 5-foot Emanation originating from the Ghast.

    Failure: The target has the &Reference[Poisoned apply=false] condition until the start of its next turn.
    Success: The target is immune to the Stench of all [[lookup @name lowercase]] for 1 hour.
*/
const optionName = "Ghast Stench";
const version = "14.5.0";
const immunityEffect = "ghast-stench-immunity";
const saveDC = 10;

try {
    if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        if (!hasImmunity(actor, macroItem.actor)) {
            const targetUuids = [token.document.uuid];
            const activity = macroItem.system.activities.find(a => a.identifier === 'save');
            if (activity) {
                const results = await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                for (let targetToken of results.saves) {
                    await addImmunity(targetToken.actor);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
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
