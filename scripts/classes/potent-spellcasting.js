/*
    Starting at 8th level, you add your Wisdom modifier to the damage you deal with any cleric cantrip.
 */
const version = "11.0";
const optionName = "Potent Spellcasting";


try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure the trigger is a spell
        if("spell" != workflow.item.type) {
            console.log(`${optionName}: not a spell`);
            return {};
        }

        // make sure it is a cantrip
        const spellLevel = workflow.castData.castLevel;
        if (spellLevel > 0) {
            console.log(`${optionName}: not a cantrip`);
            return {};
        }

        // add damage bonus
        const ability = actor.system.attributes.spellcasting;
        const abilityBonus = actor.system.abilities[ability].mod;
        let damageType = workflow.item.system.damage.parts[0][1];
        return {damageRoll: `${abilityBonus}[${damageType}]`, flavor: optionName};
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
