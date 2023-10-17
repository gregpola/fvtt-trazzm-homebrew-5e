/*
	You attempt to send one creature that you can see within range to another plane of existence. The target must succeed on a Charisma saving throw or be banished.

	If the target is native to the plane of existence you're on, you banish the target to a harmless demiplane. While there, the target is incapacitated. The target remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.

	If the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane. If the spell ends before 1 minute has passed, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. Otherwise, the target doesn't return.

	At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th.
*/
const version = "10.0.0";
const optionName = "Banishment";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const origin = lastArg.uuid;
	
	if (args[0].macroPass === "preambleComplete") {
		// check target count
		let targetCount = 1 + lastArg.spellLevel - 4;
		if (lastArg.workflow.targets.size > targetCount) {
			ui.notifications.warn(`${optionName} - incorrect number of targets`);

			let index = 0;
			for (let t of lastArg.workflow.targets) {
				if (index++ < targetCount)
					continue;
				
				lastArg.workflow.targets.delete(t);
			}
			
			game.user.updateTokenTargets(Array.from(lastArg.workflow.targets).map(t => t.id));
		}
		
	}
	else if (args[0] === "on") {
		const targetToken = canvas.tokens.get(lastArg.tokenId);
		await ChatMessage.create({ content: `${targetToken.name} was banished`, whisper: [game.user] });
		await targetToken.document.update({ "hidden": true });
	}
	else if (args[0] === "off") {
		const targetToken = canvas.tokens.get(lastArg.tokenId);
		await ChatMessage.create({ content: `${targetToken.name} returns`, whisper: [game.user] });
		await targetToken.document.update({ "hidden": false });
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
