/*
    This macro is used to handle subclass features that add riders to Rage
*/
const optionName = "Rage";
const version = "12.4.1";
const mindlessRageEffectName = "Mindless Rage Active";

try {
    if (args[0] === "on") {
        // Handle Mindless Rage
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

        // Handle Fanatical Focus
        const fanaticalFocus = actor.items.find(i => i.name === "Fanatical Focus");
        if (fanaticalFocus) {
            await fanaticalFocus.update({"system.uses.spent": 0});
        }

    }
    else if (args[0] === "off") {
        await HomebrewEffects.removeEffectByName(actor, mindlessRageEffectName);

        const fanaticalFocus = actor.items.find(i => i.name === "Fanatical Focus");
        if (fanaticalFocus) {
            await fanaticalFocus.update({"system.uses.spent": 1});
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
