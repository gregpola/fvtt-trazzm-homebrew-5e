/*
    You call forth an amorphous, 20-ft. -radius blob of black matter from the Plane of Shadows that you can direct toward
    any light source within range. You can cause this blob to change shape, creating moving shadows on nearby surfaces.
    These shadows can cause distraction and confusion, causing all viewers within the spell’s radius to suffer disadvantage
    on all Wisdom (Perception) checks relying on sight. At the end of each of the rounds of an affected creature, it can
    make a Wisdom saving throw against the spell. On a success, the spell’s effects end for the creature, as it sees through the illusion.
 */
const version = "12.3.0";
const optionName = "Shadow Cast";
const immunityEffect = "shadow-cast-immunity";
const effectName = "Shadow Cast Distraction";

try {
    let existingEffect = HomebrewHelpers.findEffect(actor, effectName, macroItem.uuid);

    if (args[0] === "on") {
        if (!hasImmunity(actor, macroItem)) {
            if (!existingEffect) {
                let effectData = {
                    name: effectName,
                    icon: 'icons/creatures/abilities/wing-batlike-purple-blue.webp',
                    changes: [
                        {
                            key: 'flags.midi-qol.disadvantage.skill.prc',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: true,
                            priority: 20
                        }
                    ],
                    statuses: [
                    ],
                    flags: {
                    },
                    origin: macroItem.uuid,
                    disabled: false
                };

                await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
            }
        }
    }
    else if (args[0] === "off") {
        if (existingEffect) {
            await MidiQOL.socket().executeAsGM('removeEffects', {
                'actorUuid': actor.uuid,
                'effects': [existingEffect.id]
            });
        }
    }
    else if (args[0] === "each") {
        if (!hasImmunity(actor, macroItem)) {
            let saveRoll = await actor.rollAbilitySave("wis", {flavor: "Shadow Cast", damageType: "poison"});
            if (saveRoll.total >= macroItem.parent.system.attributes.spelldc) {
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
        icon: "icons/magic/perception/orb-eye-scrying.webp",
        origin: macroItem.uuid,
        duration: {startTime: game.time.worldTime, seconds: 86400},
        changes: [],
        disabled: false
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}

function hasImmunity(targetActor, macroItem) {
    return targetActor.effects?.find(ef => ef.name === immunityEffect && ef.origin === macroItem.uuid);
}
