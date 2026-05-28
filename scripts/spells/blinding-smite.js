/*
    The target hit by the strike takes an extra 3d8 Radiant damage from the attack, and the target has the Blinded
    condition until the spell ends. At the end of each of its turns, the Blinded target makes a Constitution saving
    throw, ending the spell on itself on a success.

    Using a Higher-Level Spell Slot. The extra damage increases by 1d8 for each spell slot level above 3.
*/
const version = "14.5.0";
const optionName = "Blinding Smite";
const damageType = "radiant";
const effectName = "Blinded";

try {
    if (args[0].macroPass === "DamageBonus") {
        // apply secondary effect
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const applyActivity = await macroItem.system.activities.find(a => a.identifier === 'apply-blinded');
            if (applyActivity) {
                const targetUuids = Array.from(workflow.hitTargets).map(t => t.document.uuid);
                const hookId = Hooks.on("midi-qol.RollComplete", async (wf) => {
                    if (wf.id !== workflow.id) return;
                    Hooks.off("midi-qol.RollComplete", hookId);
                    await MidiQOL.completeActivityUse(applyActivity, {midiOptions: {targetUuids}});
                });
            }
        }

        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].BlindingSmite?.level ?? 3;
        const diceCount = Math.max(Number(spellLevel), 3);
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
