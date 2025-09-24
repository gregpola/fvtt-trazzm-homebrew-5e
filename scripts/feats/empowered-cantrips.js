/*
    You have mastered the casting of damaging cantrips, focusing your energy to empower your castings. The first time
    each turn that you cast a damaging cantrip, you can add your ability modifier to the damage you deal.
*/
const optionName = "Empowered Cantrips";
const version = "13.5.0";
const timeFlag = "last-empowered-cantrip";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (rolledItem.type === "spell" && workflow.castData.castLevel === 0) {
            // Once per turn
            if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                // return the damage
                const abilityBonus = actor.system.attributes.spell.mod;
                return new CONFIG.Dice.DamageRoll(`${abilityBonus}[${optionName}]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
            }
        }
        else {
            console.log(`${optionName}: not a cantrip`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
