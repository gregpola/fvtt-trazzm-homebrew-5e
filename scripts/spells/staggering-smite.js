/*
    The target takes an extra 4d6 Psychic damage from the attack, and the target must succeed on a Wisdom saving throw
    or have the Stunned condition until the end of your next turn.

    Using a Higher-Level Spell Slot. The extra damage increases by 1d6 for each spell slot level above 4.
*/
const version = "14.5.0";
const optionName = "Staggering Smite";
const damageType = "psychic";

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

        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].StaggeringSmite?.level ?? 4;
        const diceCount = Math.max(Number(spellLevel), 4);
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
