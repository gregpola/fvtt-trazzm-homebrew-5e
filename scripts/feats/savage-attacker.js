/**
 *  You’ve trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can
 *  roll the weapon’s damage dice twice and use either roll against the target.
 */
const optionName = "Savage Attacker";
const version = "14.5.0";
const timeFlag = "savage-attacker-time";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};
        if (rolledItem.type !== "weapon") return {};

        // Check for availability i.e. once per actors turn
        if (game.combat && HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
            let content = `
            <p>Apply ${optionName} to this attack?</p>
            <sub>Once per turn, when you hit a target with a weapon, roll the weapon’s damage dice twice and use either roll against the target.</sub>
            <p>Current roll: ${workflow.damageRoll.result}</p>`;

            const proceed = await foundry.applications.api.DialogV2.confirm({
                window: {
                    title: `${optionName}`,
                },
                content: content,
                rejectClose: false,
                modal: true
            });

            if (proceed) {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                // reroll the damage roll
                const oldTotal = workflow.damageRoll.total;
                const formula = workflow.damageRoll.formula;
                let newDamageRoll = await new CONFIG.Dice.DamageRoll(formula, workflow.item.getRollData(), workflow.damageRoll.options).evaluate();
                await game.dice3d?.showForRoll(newDamageRoll);
                const newTotal = newDamageRoll.total;

                // if higher, return the extra damage
                if (newTotal > oldTotal) {
                    const damageBonus = newTotal - oldTotal;
                    return {damageRoll: `${damageBonus}[${workflow.defaultDamageType}]`, flavor: optionName};
                }

                return {};
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
