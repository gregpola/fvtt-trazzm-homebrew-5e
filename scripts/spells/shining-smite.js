/*
    The target hit by the strike takes an extra 2d6 Radiant damage from the attack. Until the spell ends, the target
    sheds Bright Light in a 5-foot radius, attack rolls against it have Advantage, and it can’t benefit from the Invisible condition.

    Immediately after hitting a target with a Melee weapon or an Unarmed Strike.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1.
*/
const version = "14.5.0";
const optionName = "Shining Smite";

try {
    if (args[0].macroPass === "DamageBonus") {
        // apply secondary effect
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const applyActivity = await macroItem.system.activities.find(a => a.identifier === 'apply-shining');
            if (applyActivity) {
                const targetUuids = Array.from(workflow.hitTargets).map(t => t.document.uuid);
                const hookId = Hooks.on("midi-qol.RollComplete", async (wf) => {
                    if (wf.id !== workflow.id) return;
                    Hooks.off("midi-qol.RollComplete", hookId);
                    await MidiQOL.completeActivityUse(applyActivity, {midiOptions: {targetUuids}});
                });
            }
        }

        // return damage bonus @item.level
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].ShiningSmite?.level ?? 2;
        const diceCount = Number(spellLevel);

        return new game.system.dice.DamageRoll(`${diceCount}d6`, {}, {
            isCritical: workflow.isCritical,
            properties: ["mgc"],
            type: "radiant",
            flavor: optionName
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
