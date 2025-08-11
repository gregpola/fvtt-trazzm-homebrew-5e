/*
    As you hit the target, it takes an extra 1d6 Fire damage from the attack. At the start of each of its turns until
    the spell ends, the target takes 1d6 Fire damage and then makes a Constitution saving throw. On a failed save, the
    spell continues. On a successful save, the spell ends.

    Using a Higher-Level Spell Slot. All the damage increases by 1d6 for each spell slot level above 1.
*/
const version = "12.4.1";
const optionName = "Searing Smite";
const effectName = "Searing Smite burning";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].SearingSmite.level ?? 1;
        const diceCount = spellLevel;

        await applySearing(targetToken, actor.system.attributes.spell.dc, spellLevel);

        return new game.system.dice.DamageRoll(`${diceCount}d6`, {}, {
            isCritical: workflow.isCritical,
            properties: ["mgc"],
            type: "fire",
            flavor: optionName
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applySearing(targetToken, dc, spellLevel) {
    let effectData = {
        name: effectName,
        icon: "icons/magic/fire/dagger-rune-enchant-flame-strong-red.webp",
        origin: actor.uuid,
        changes: [
            {
                key:"flags.midi-qol.OverTime",
                value: `turn=start, saveAbility=con, saveDC=${dc}, damageRoll=${spellLevel}d6, damageType=fire, damageBeforeSave=true, label=${effectName}`,
                mode: 0,
                priority: 20
            },
            {
                key: 'macro.tokenMagic',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'fire',
                priority: 21
            }
        ],
        duration: {seconds: 60}};

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
    await ChatMessage.create({content: `${targetToken.name} is set on fire and begins to burn!`});
}
