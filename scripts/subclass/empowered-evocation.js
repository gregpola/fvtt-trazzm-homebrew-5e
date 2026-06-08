/*
	Whenever you cast a Wizard spell from the Evocation school, you can add your Intelligence modifier to one damage roll of that spell.
*/
const optionName = "Empowered Evocation";
const version = "14.5.0";

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure the trigger is a Wizard evocation spell
        if (rolledItem.type === "spell" && rolledItem.system.sourceClass === "wizard" && rolledItem.system.school === "evo") {
            const abilityBonus = actor.system.abilities.int.mod;
            return new CONFIG.Dice.DamageRoll(`+${abilityBonus}[${optionName}]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
