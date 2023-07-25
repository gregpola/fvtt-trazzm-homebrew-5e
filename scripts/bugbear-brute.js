/*
	A melee weapon deals one extra die of its damage when the bugbear hits with it (included in the attack).
*/
const version = "10.0";
const optionName = "Brute";

try {
    if (args[0].macroPass === "postDamageRoll") {
        const wf = scope.workflow;

        // sanity checks
        if (!wf.damageRoll) return;

        // Skip if the action isn't a melee weapon attack
        if (wf.item.system.actionType !== "mwak") {
            console.log(`${optionName} - action type isn't applicable`);
            return;
        }

        let damageFormula = wf.damageRoll._formula;
        let diceNum = Number(damageFormula.substring(0,1)) + 1;
        let restOfFormula = damageFormula.substring(1);
        let newFormula = diceNum + restOfFormula;
        let damageRoll = await new Roll(newFormula).roll({async: true});
        await wf.setDamageRoll(damageRoll);
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
