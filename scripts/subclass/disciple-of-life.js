/*
    When a spell you cast with a spell slot restores Hit Points to a creature, that creature regains additional Hit
    Points on the turn you cast the spell. The additional Hit Points equal 2 plus the spell slot's level.
*/
const optionName = "Disciple of Life";
const version = "12.4.0";

try {
    if (args[0].macroPass === "DamageBonus" && rolledItem.type === "spell" && rolledActivity.healing !== undefined) {
        const spellLevel = workflow.castData.castLevel;
        if (spellLevel > 0) {
            const healAmount = 2 + spellLevel;
            return new CONFIG.Dice.DamageRoll(`+${healAmount}[Disciple of Life]`, {}, {type: 'healing', properties: [...rolledItem.system.properties]});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
