/*
    The target takes an extra 4d6 Psychic damage from the attack, and the target must succeed on a Wisdom saving throw
    or have the Stunned condition until the end of your next turn.

    Using a Higher-Level Spell Slot. The extra damage increases by 1d6 for each spell slot level above 4.
*/
const version = "12.4.1";
const optionName = "Staggering Smite";
const damageType = "psychic";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].StaggeringSmite?.level ?? 4;
        const diceCount = Math.max(spellLevel, 4);

        const config = { undefined, ability: "wis", target: actor.system.attributes.spell.dc };
        const dialog = {};
        const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
        let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
        if (!saveResult[0].isSuccess) {
            await applyEffects(targetToken, macroItem, actor.system.attributes.spell.dc);
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
        name: optionName,
        icon: "icons/skills/wounds/bone-broken-knee-beam.webp",
        origin: macroItem.uuid,
        type: "base",
        transfer: false,
        statuses: [
            "stunned"
        ],
        changes: [],
        flags: {
            dae: {
                specialDuration: ['shortRest', 'longRest', 'combatEnd', 'turnEndSource']
            }
        },
        duration: {seconds: null}};

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
}
