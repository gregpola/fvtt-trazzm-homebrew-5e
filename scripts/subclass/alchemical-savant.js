/*
    You've developed masterful command of magical chemicals, enhancing the healing and damage you create through them.
    Whenever you cast a spell using your alchemist’s supplies as the spellcasting focus, you gain a bonus to one roll of
    the spell. That roll must restore hit points or be a damage roll that deals acid, fire, necrotic, or poison damage,
    and the bonus equals your Intelligence modifier (minimum of +1).
*/
const version = "14.5.0";
const optionName = "Alchemical Savant";
const eligibleDamageTypes = ['healing', 'acid', 'fire', 'poison'];

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure the trigger is a spell
        if (rolledItem.type === "spell") {
            // check the damage type
            if (eligibleDamageTypes.includes(workflow.defaultDamageType)) {
                const abilityBonus = actor.system.abilities.int.mod;
                return new CONFIG.Dice.DamageRoll(`+${abilityBonus}[${optionName}]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
