/*
	If the boar moves at least 20 feet straight toward a target and then hits it with a tusk attack on the same turn,
	the target takes an extra 3 (1d6) slashing damage. If the target is a creature, it must succeed on a DC 11 Strength
	saving throw or be knocked prone.
 */
const version = "11.0";
const optionName = "Charge - Boar";

try {
	if (args[0].macroPass === "preItemRoll") {
		targetToken = workflow?.targets?.first();
		return await HomebrewMacros.chargeTarget(token, targetToken, 20);
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
