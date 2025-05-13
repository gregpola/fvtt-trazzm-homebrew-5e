/*
    The target takes an extra 1d6 Necrotic damage from the attack, and it must succeed on a Wisdom saving throw or have
    the Frightened condition until the spell ends. At the end of each of its turns, the Frightened target repeats the
    save, ending the spell on itself on a success.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1.
*/
const version = "12.4.1";
const optionName = "Wrathful Smite";
const damageType = "necrotic";
const effectName = "Wrathful Smite Frightened";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].WrathfulSmite.level ?? 1;
        const diceCount = spellLevel;

        const config = { undefined, ability: "wis", target: actor.system.attributes.spelldc };
        const dialog = {};
        const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
        let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
        if (!saveResult[0].isSuccess) {
            await applyEffects(targetToken, macroItem, actor.system.attributes.spelldc);
        }

        return new game.system.dice.DamageRoll(`${diceCount}d6`, {}, {
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
        icon: "icons/magic/death/weapon-sword-skull-purple.webp",
        origin: macroItem.uuid,
        statuses: [
            "frightened"
        ],
        changes: [
            {
                key:"flags.midi-qol.OverTime",
                value: `turn=end, saveAbility=wis, saveDC=${saveDC}, label=${effectName}`,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 20
            }],
        duration: {seconds: 60}};

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
}
