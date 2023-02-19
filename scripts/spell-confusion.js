const version = "10.0.0";
const optionName = "Confusion";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0] === "each") {

		let confusionRoll = await new Roll("1d10").evaluate({ async: false }).total;
		let content;
		switch (confusionRoll) {
			case 1:
				content = "The creature uses all its movement to move in a random direction. To determine the direction, roll a  [[d8]] and assign a direction to each die face. The creature doesn't take an action this turn.";
				break;
			case 2:
				content = "	The creature doesn't move or take actions this turn.";
				break;
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				content = "The creature uses its action to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the creature does nothing this turn.";
				break;
			case 8:
			case 9:
			case 10:
				content = "The creature can act and move normally.";
				break;
		}
		await ChatMessage.create({ content: `Confusion roll for ${actor.name} is ${confusionRoll}:<br> ` + content });
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
