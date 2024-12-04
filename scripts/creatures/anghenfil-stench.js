const version = "12.3.0";
const optionName = "Anghenfil Stench";
const immunityEffect = "anghenfil-stench-immunity";
const saveDC = 15;
const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

try {
    if (args[0] === "on") {
    }
    else if (args[0] === "off") {
    }
    else if (args[0] === "each") {
        if (!hasImmunity(actor, item.actor)) {
            let saveRoll = await actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});
            if (saveRoll.total < saveDC) {
                await HomebrewEffects.applyPoisonedEffect(actor, macroItem.uuid);
            }
            else {
                await addImmunity(actor);
            }
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
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
