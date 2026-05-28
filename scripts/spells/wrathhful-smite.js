/*
    The target takes an extra 1d6 Necrotic damage from the attack, and it must succeed on a Wisdom saving throw or have
    the Frightened condition until the spell ends. At the end of each of its turns, the Frightened target repeats the
    save, ending the spell on itself on a success.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1.
*/
const version = "14.5.0";
const optionName = "Wrathful Smite";
const damageType = "necrotic";
const effectName = "Wrathful Smite Frightened";

try {
    if (args[0].macroPass === "DamageBonus") {
        // apply secondary effect
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const applyActivity = await macroItem.system.activities.find(a => a.identifier === 'save');
            if (applyActivity) {
                const targetUuids = Array.from(workflow.hitTargets).map(t => t.document.uuid);
                const hookId = Hooks.on("midi-qol.RollComplete", async (wf) => {
                    if (wf.id !== workflow.id) return;
                    Hooks.off("midi-qol.RollComplete", hookId);
                    await MidiQOL.completeActivityUse(applyActivity, {midiOptions: {targetUuids}});
                });
            }
        }

        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].WrathfulSmite.level ?? 1;
        const diceCount = Number(spellLevel);
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
