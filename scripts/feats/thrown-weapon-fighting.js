/*
    When you hit with a ranged attack roll using a weapon that has the Thrown property, you gain a +2 bonus to the damage roll.
*/
const version = "12.4.0";
const optionName = "Thrown Weapon Fighting";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};

        if (rolledItem.system.properties?.has('thr')) {
            return new CONFIG.Dice.DamageRoll('+2[TWF]', {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
