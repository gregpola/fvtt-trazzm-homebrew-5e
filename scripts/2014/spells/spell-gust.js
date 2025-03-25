/*
	You seize the air and compel it to create one of the following effects at a point you can see within range:

		* One Medium or smaller creature that you choose must succeed on a Strength saving throw or be pushed up to 5 feet away from you.
		* You create a small blast of air capable of moving one object that is neither held nor carried and that weighs no more than 5 pounds. The object is pushed up to 10 feet away from you. It isn’t pushed with enough force to cause damage.
		* You create a harmless sensory effect using air, such as causing leaves to rustle, wind to slam shutters shut, or your clothing to ripple in a breeze.
*/
const version = "11.0";
const optionName = "Gust";

try {
	const lastArg = args[args.length - 1];
	if (args[0].macroPass === "postActiveEffects") {
		if (workflow.failedSaves.size > 0) {
			let target = workflow.failedSaves.first();
			await HomebrewMacros.pushTarget(token, target, 1);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
