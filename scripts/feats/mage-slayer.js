/*
    Concentration Breaker. When you damage a creature that is concentrating, it has Disadvantage on the saving throw it
    makes to maintain Concentration.
 */
const version = "12.4.0";
const optionName = "Mage Slayer - Concentration Breaker";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageApplication") {
        for (let targetToken of workflow.hitTargets) {
            if (MidiQOL.getConcentrationEffect(targetToken.actor)) {
                await applyConcentrationDisadvantage(targetToken);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyConcentrationDisadvantage(targetToken) {
    let effectData = {
        name: optionName,
        icon: "icons/skills/melee/strike-dagger-blood-red.webp",
        origin: null,
        statuses: [],
        changes: [
            {
                key: "flags.automated-conditions-5e.concentration.disadvantage",
                value: "once",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 1
            }],
        flags: {
            dae: {
                specialDuration: ['combatEnd', 'turnStart'],
                stackable: 'none'
            }
        },
        duration: {turns: 1}
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
}
