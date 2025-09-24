/*
    When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat
    any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit.
*/
const version = "12.4.1";
const optionName = "Great Weapon Fighting";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        // check action eligibility
        if (rolledItem.type === "weapon"
            &&  ['simpleM', 'martialM'].includes(rolledItem.system.type?.value)
            && workflow.activity?.hasAttack
            && workflow.activity.attack.type?.classification === 'weapon'
            && (rolledItem.system.properties?.has('two') || rolledItem.system.properties?.has('ver'))
            && (midiData.attackRoll.options.attackMode === 'twoHanded')) {

            // update damage rolls to min3
            let damageRolls = await Promise.all(workflow.damageRolls.map(async roll => {
                let newFormula = '';
                for (let i of roll.terms) {
                    if (i.isDeterministic) {
                        newFormula += i.expression;
                    } else if (i.expression.toLowerCase().includes('min3')) {
                        newFormula += i.formula;
                    } else if (i.flavor) {
                        newFormula += i.expression + 'min3[' + i.flavor + ']';
                    } else {
                        newFormula += i.expression + 'min3';
                    }
                }

                return await new CONFIG.Dice.DamageRoll(newFormula, workflow.item.getRollData(), roll.options).evaluate();
            }));

            await workflow.setDamageRolls(damageRolls);
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
