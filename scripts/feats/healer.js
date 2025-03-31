/*
    Whenever you roll a die to determine the number of Hit Points you restore with a spell or with this feat’s Battle
    Medic benefit, you can reroll the die if it rolls a 1, and you must use the new roll.
*/
const version = "12.4.0";
const optionName = "Healer";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        if (rolledItem.type !== "spell" || rolledActivity.actionType !== "heal") return;

        for (let i = 0; i < workflow.damageRoll.terms.length; i++) {
            if ((workflow.damageRoll.terms[i] instanceof Die)
                && workflow.damageRoll.terms[i].results?.find(r => r.result === 1)) {
                await workflow.damageRoll.terms[i].reroll("r1");
                const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(workflow.damageRoll.terms);
                await workflow.setDamageRoll(newDamageRoll)
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
