/*
	Starting at 6th level, you can call on your patron to alter fate in your favor. When you make an ability check or a saving throw, you can use this feature to add a d10 to your roll. You can do so after seeing the initial roll but before any of the roll's effects occur.

	Once you use this feature, you can't use it again until you finish a short or long rest.
*/
const version = "10.0.0";
const optionName = "Dark One's Own Luck";

try {
	const lastArg = args[args.length - 1];
	
	if (args[0].macroPass === "preCheckSaves") {
		const actorToken = canvas.tokens.get(lastArg.tokenId);
			//setProperty(lastArg.workflow, 'advantage', true);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
