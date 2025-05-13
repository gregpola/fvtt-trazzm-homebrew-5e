/*
    The target hit by the attack roll takes an extra 5d10 Force damage from the attack. If the attack reduces the target
    to 50 Hit Points or fewer, the target must succeed on a Charisma saving throw or be transported to a harmless
    demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target
    reappears in the space it left or in the nearest unoccupied space if that space is occupied.
*/
const version = "12.4.1";
const optionName = "Banishing Smite";
const damageType = "force";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].BanishingSmite?.level ?? 5;
        const diceCount = Math.max(spellLevel, 5);

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
