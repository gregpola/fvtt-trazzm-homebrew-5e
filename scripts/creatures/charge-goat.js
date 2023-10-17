const version = "11.0";
const optionName = "Charge - Goat";

try {
	if (args[0].macroPass === "preItemRoll") {
		targetToken = workflow?.targets?.first();
		return await HomebrewMacros.chargeTarget(token, targetToken, 20);
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
