/*
	You create a lash of lightning energy that strikes at one creature of your choice that you can see within 15 feet of
	you. The target must succeed on a Strength saving throw or be pulled up to 10 feet in a straight line toward you and
	then take 1d8 lightning damage if it is within 5 feet of you.
*/
const version = "11.0";
const optionName = "Lightning Lure";

try {
	if ((args[0].macroPass === "postActiveEffects") && (workflow.failedSaves.size > 0)) {
		// move target
		const targetToken = workflow.failedSaves.first();
		await HomebrewMacros.pullTarget(token, targetToken, 2);
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
