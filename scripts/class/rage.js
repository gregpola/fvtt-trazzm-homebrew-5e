/*
    This macro is used to handle subclass features that add riders to Rage
*/
const optionName = "Rage";
const version = "12.4.0";


// Rage ON
/*
    Berserker - Mindless Rage
    You have Immunity to the Charmed and Frightened conditions while your Rage is active. If you're Charmed or
    Frightened when you enter your Rage, the condition ends on you.
 */
const mindlessRageEffectName = "mindless-rage-effect";
const mindlessRage = actor.items.find(i => i.name === "Mindless Rage");

if (mindlessRage) {
    // remove existing charmed or frightened
    const matchingEffects = HomebrewEffects.filterEffectsByConditions(actor, ["Charmed", "Frightened"]);
    if (matchingEffects.length > 0) {
        const effectIdList = matchingEffects.map(obj => obj.id);
        await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: actor.uuid, effects: effectIdList});
    }
    await actor.toggleStatusEffect("charmed", {active: false});
    await actor.toggleStatusEffect("frightened", {active: false});

    await addMindlessRageEffect(actor, item);
}

async function addMindlessRageEffect(actor) {
    let effectData = {
        name: mindlessRageEffectName,
        icon: 'icons/magic/fire/flame-burning-eye.webp',
        changes: [
            {
                key: 'system.traits.ci.value',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 'charmed',
                priority: 20
            },
            {
                key: 'system.traits.ci.value',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 'frightened',
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: []
            }
        },
        origin: actor.uuid,
        duration: {
            seconds: null
        },
        disabled: false
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
}



// Rage OFF
const mindlessRageEffectName = "mindless-rage-effect";

// turn off subclass features
await HomebrewEffects.removeEffectByName(actor, mindlessRageEffectName);

