/*
	One creature or object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration. The spell can levitate a target that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected.

	The target can move only by pushing or pulling against a fixed object or surface within reach (such as a wall or a ceiling), which allows it to move as if it were climbing. You can change the target’s altitude by up to 20 feet in either direction on your turn. If you are the target, you can move up or down as part of your move. Otherwise, you can use your action to move the target, which must remain within the spell’s range.

	When the spell ends, the target floats gently to the ground if it is still aloft.
*/
const version = "10.0.0";
const optionName = "Levitate";

try {
	const lastArg = args[args.length - 1];
	const targetToken = game.canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
		await targetToken.document.update({ "elevation": 20 });
		await ChatMessage.create({ content: `${optionName} - ${targetToken.name} is levitated 20ft` });
	}
	else if (args[0] === "off") {
		await targetToken.document.update({ "elevation": 0 });
		await ChatMessage.create({ content: `${optionName} - ${targetToken.name} is returned to the ground` });
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
