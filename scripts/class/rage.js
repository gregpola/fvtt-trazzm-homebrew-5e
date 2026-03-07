/*
    This macro is used to handle subclass features that add riders to Rage
*/
const optionName = "Rage";
const version = "13.5.0";
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

            let activity = await mindlessRage.system.activities.find(a => a.identifier === 'activate');
            if (activity) {
                await activity.use();
            }
        }

        // Handle Fanatical Focus
        const fanaticalFocus = actor.items.find(i => i.name === "Fanatical Focus");
        if (fanaticalFocus) {
            await fanaticalFocus.update({"system.uses.spent": 0});
        }

        // Handle Wild Heart - Rage of the Wilds
        const rageOfTheWilds = actor.items.find(i => i.name === "Rage of the Wilds");
        if (rageOfTheWilds) {
            let activity = await rageOfTheWilds.system.activities.find(a => a.identifier === 'activate');
            if (activity) {
                await activity.use();
            }
        }

        // Handle Wild Heart - Power of the Wilds
        const powerOfTheWilds = actor.items.find(i => i.name === "Power of the Wilds");
        if (powerOfTheWilds) {
            let activity = await powerOfTheWilds.system.activities.find(a => a.identifier === 'activate');
            if (activity) {
                await activity.use();
            }
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
