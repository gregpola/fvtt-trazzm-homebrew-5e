/*
	You or a creature you touch becomes Invisible until the spell ends. Anything the target is wearing or carrying is Invisible as long as it is on the target’s person.
*/
const version = "10.0.0";
const optionName = "Greater Invisibility";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const token = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
		await ChatMessage.create({ content: `${token.name} turns invisible`, whisper: [game.user] });
		await token.document.update({ "hidden": true });
	}
	else if (args[0] === "off") {
		await ChatMessage.create({ content: `${token.name} re-appears`, whisper: [game.user] });
		await token.document.update({ "hidden": false });
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
