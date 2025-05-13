/*
    The target hit by the strike takes an extra 3d8 Radiant damage from the attack, and the target has the Blinded
    condition until the spell ends. At the end of each of its turns, the Blinded target makes a Constitution saving
    throw, ending the spell on itself on a success.

    Using a Higher-Level Spell Slot. The extra damage increases by 1d8 for each spell slot level above 3.
*/
const version = "12.4.1";
const optionName = "Blinding Smite";
const damageType = "radiant";
const effectName = "Blinded";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].BlindingSmite?.level ?? 3;
        const diceCount = spellLevel;

        await applyEffects(targetToken, macroItem, actor.system.attributes.spelldc);

        return new game.system.dice.DamageRoll(`${diceCount}d8`, {}, {
            isCritical: workflow.isCritical,
            properties: ["mgc"],
            type: damageType,
            flavor: optionName
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyEffects(targetToken, macroItem, saveDC) {
    let effectData = {
        name: effectName,
        icon: "icons/skills/wounds/injury-eyes-blood-red-pink.webp",
        origin: macroItem.uuid,
        type: "base",
        transfer: false,
        statuses: [
            "blinded"
        ],
        changes: [
            {
                key:"flags.midi-qol.OverTime",
                value: `turn=end, saveAbility=con, saveDC=${saveDC}, label=${effectName}`,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 20
            }],
        flags: {
            dae: {
                specialDuration: ['shortRest', 'longRest', 'combatEnd']
            }
        },
        duration: {seconds: 60}};

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
}
