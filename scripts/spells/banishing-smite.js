/*
    The target hit by the attack roll takes an extra 5d10 Force damage from the attack. If the attack reduces the target
    to 50 Hit Points or fewer, the target must succeed on a Charisma saving throw or be transported to a harmless
    demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target
    reappears in the space it left or in the nearest unoccupied space if that space is occupied.
*/
const version = "14.5.0";
const optionName = "Banishing Smite";
const damageType = "force";

try {
    if (args[0].macroPass === "DamageBonus") {
        // apply secondary effect
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const applyActivity = await macroItem.system.activities.find(a => a.identifier === 'banish');
            if (applyActivity) {
                const targetUuids = Array.from(workflow.hitTargets).map(t => t.document.uuid);
                const hookId = Hooks.on("midi-qol.RollComplete", async (wf) => {
                    if (wf.id !== workflow.id) return;
                    Hooks.off("midi-qol.RollComplete", hookId);

                    // check conditions
                    let token = wf.hitTargets.first();
                    if (token && token.actor.system.attributes.hp.value <= 50) {
                        await MidiQOL.completeActivityUse(applyActivity, {midiOptions: {targetUuids}});
                    }
                });
            }
        }

        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].BanishingSmite?.level ?? 5;
        const diceCount = Math.max(Number(spellLevel), 5);
        return new game.system.dice.DamageRoll(`${diceCount}d10`, {}, {
            isCritical: workflow.isCritical,
            properties: ["mgc"],
            type: damageType,
            flavor: optionName
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
