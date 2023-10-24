/*
	The myrmidon uses Multiattack. Each attack that hits deals an extra 7 (2d6) fire damage.
*/
const version = "11.0";
const optionName = "Fiery Strikes";

try {
    if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
        if (workflow.isCritical) {
            return {damageRoll: `2d6+12[fire]`, flavor: `${optionName}`};
        }

        return {damageRoll: `2d6[fire]`, flavor: `${optionName}`};
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
