/*
	On failure, the target’s Hit Point maximum decreases by an amount equal to the Necrotic damage taken, and the Vampire regains
	Hit Points equal to that amount.
*/
const optionName = "Vampire Bite";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            const necroticRolls = workflow.damageDetail.filter(i => ['necrotic'].includes(i.type));
            if (necroticRolls && necroticRolls.length > 0) {
                let totalNecroticDamage = 0;
                for (let roll of necroticRolls) {
                    totalNecroticDamage += roll.damage;
                }

                if (totalNecroticDamage > 0) {
                    await HomebrewMacros.applyLifeDrainEffect(token, targetToken.actor, totalNecroticDamage, macroItem);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
