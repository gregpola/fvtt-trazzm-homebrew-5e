/*
	You attempt to send one creature that you can see within range to another plane of existence. The target must succeed on a Charisma saving throw or be banished.

	If the target is native to the plane of existence you're on, you banish the target to a harmless demiplane. While there, the target is incapacitated. The target remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.

	If the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane. If the spell ends before 1 minute has passed, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. Otherwise, the target doesn't return.

	At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th.
*/
const version = "12.3.0";
const optionName = "Banishment";
const flagName = "banishment-flag";
const mutationFlag = "banishment-mutation";

try {
	if (args[0].macroPass === "preambleComplete") {
		const spellLevel = workflow.castData.castLevel;
		let maxTargets = spellLevel - 3;

		// check target count
		if (workflow.targets.size > maxTargets) {
			ui.notifications.warn(`${optionName} - incorrect number of targets`);

			let index = 0;
			for (let t of workflow.targets) {
				if (index++ < targetCount)
					continue;

				workflow.targets.delete(t);
			}

			game.user.updateTokenTargets(Array.from(workflow.targets).map(t => t.id));
		}
	}
	else if (args[0] === "on") {
		const targetToken = canvas.tokens.get(lastArgValue.tokenId);

		// disable all active effects
		let disabledEffects = [];
		for (let effect of targetToken.actor.effects) {
			if (!effect.disabled && effect.name !== optionName) {
				await effect.update({disabled: true});
				disabledEffects.push(effect.id);
			}
		}
		await targetToken.actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, disabledEffects);
		await targetToken.document.update({ "hidden": true });
		await ChatMessage.create({ content: `${targetToken.name} was banished`, whisper: [game.user] });
	}
	else if (args[0] === "off") {
		const targetToken = canvas.tokens.get(lastArgValue.tokenId);
		const flag = targetToken.actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (flag) {
			await targetToken.actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);

			for (let effectId of flag) {
				let effect = targetToken.actor.effects.find(e => e.id === effectId);
				if (effect) {
					await effect.update({disabled: false});
				}
			}
		}

		await targetToken.document.update({ "hidden": false });
		await ChatMessage.create({ content: `${targetToken.name} returns`, whisper: [game.user] });
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
