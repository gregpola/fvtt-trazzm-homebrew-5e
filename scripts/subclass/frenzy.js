/*
	If you use Reckless Attack while your Rage is active, you deal extra damage to the first target you hit on your turn
	with a Strength-based attack. To determine the extra damage, roll a number of d6s equal to your Rage Damage bonus,
	and add them together. The damage has the same type as the weapon or Unarmed Strike used for the attack.
*/
const optionName = "Frenzy";
const version = "12.4.0";
const timeFlag = "last-frenzy";

try {
    if (args[0].macroPass === "DamageBonus") {
        const rageEffect = HomebrewHelpers.findEffect(actor, "Rage");
        const recklessEffect = HomebrewHelpers.findEffect(actor, "Reckless");

        if (rageEffect && recklessEffect && HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            const damageDice = actor.system.scale.barbarian["rage-damage"];
            const damageRoll = `${damageDice}d6`;
            await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
            return new CONFIG.Dice.DamageRoll(`${damageRoll}[Frenzy]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
