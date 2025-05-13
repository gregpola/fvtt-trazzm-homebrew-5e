/*
    The target hit by the strike takes an extra 2d6 Radiant damage from the attack. Until the spell ends, the target
    sheds Bright Light in a 5-foot radius, attack rolls against it have Advantage, and it can’t benefit from the Invisible condition.

    Immediately after hitting a target with a Melee weapon or an Unarmed Strike.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1.
*/
const version = "12.4.1";
const optionName = "Shining Smite";

try {
    if (args[0].macroPass === "DamageBonus") {
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].ShiningSmite?.level ?? 2;
        const diceCount = 1 + spellLevel;

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
