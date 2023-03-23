/*
	When you take damage from a creature that is within 10 feet of you, you can use your reaction to emanate telekinetic energy. The creature that dealt damage to you must make a Strength saving throw (DC equals 8 + your proficiency bonus + the ability modifier of the score increased by this feat). On a failed save, the creature takes 2d8 force damage and is pushed up to 10 feet away from you. On a successful save, the creature takes half as much damage and isn’t pushed. You can use this reaction a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Gift of the Gem Dragon - Telekinetic Reprisal";

try {
	const lastArg = args[args.length - 1];
	let shover = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postSave" && lastArg.failedSaves.length > 0) {
		let target = lastArg.failedSaves[0];
		await HomebrewMacros.pushTarget(shover, target.object, 2); 
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
	return false;
}
