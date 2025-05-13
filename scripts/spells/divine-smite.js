/*
    The target takes an extra 2d8 Radiant damage from the attack. The damage increases by 1d8 if the target is a Fiend or an Undead.

    Immediately after hitting a target with a Melee weapon or an Unarmed Strike.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1.
*/
const version = "12.4.1";
const optionName = "Divine Smite";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        let undead = ["undead", "fiend"].some(type => (targetToken.actor.system.details.type?.value || "").toLowerCase().includes(type));
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].DivineSmite.level ?? 1;
        const diceCount = 1 + spellLevel + (undead ? 1 : 0);

        return new game.system.dice.DamageRoll(`${diceCount}d8`, {}, {
            isCritical: workflow.isCritical,
            properties: ["mgc"],
            type: "radiant",
            flavor: optionName
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
