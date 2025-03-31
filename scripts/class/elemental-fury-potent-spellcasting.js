/*
    Add your Wisdom modifier to the damage you deal with any Druid cantrip.

*/
const version = "12.4.0";
const optionName = "Elemental Fury: Potent Spellcasting";

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure the trigger is a druid spell
        if (rolledItem.type !== "spell" || rolledItem.system.sourceClass !== "druid") {
            console.log(`${optionName}: not a druid spell`);
            return {};
        }

        // make sure it is a cantrip
        const spellLevel = workflow.castData.castLevel;
        if (spellLevel > 0) {
            console.log(`${optionName}: not a cantrip`);
            return {};
        }

        const abilityBonus = actor.system.abilities.wis.mod;
        return new CONFIG.Dice.DamageRoll(`+${abilityBonus}[ElementalFury]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
