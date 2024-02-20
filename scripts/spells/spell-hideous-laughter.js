/*
	A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits
	of laughter if this spell affects it. The target must succeed on a Wisdom saving throw or fall prone, becoming
	Incapacitated and unable to stand up for the Duration. A creature with an Intelligence score of 4 or less isn’t affected.

	At the end of each of its turns, and each time it takes damage, the target can make another Wisdom saving throw. The
	target has advantage on the saving throw if it’s triggered by damage. On a success, the spell ends.
*/
const version = "11.1";
const optionName = "Tashas Hideous Laughter";

try {
	if (args[0].macroPass === "preSave") {
		// remove targets with int 4 or lower
		let newTargets = [];
		for (let target of workflow.targets) {
			if (target.actor.system.abilities['int'].value > 4) {
				newTargets.push(target);
			}
		}

		if (newTargets.length < workflow.targets.length) {
			workflow.update({ "targets": newTargets });
		}
	}
	else if (args[0].macroPass === "isDamaged") {
		// if the victim of the spell is damaged, they can re-save with advantage
		let effect = actor.effects.find(i=>i.name === optionName);
		if (effect) {
			let dc = 13; // TODO find the DC in the overtime
			const overtime = effect.changes.find(i => i.key === 'flags.midi-qol.OverTime');
			if (overtime) {
				const startIndex = overtime.value.indexOf("saveDC=");
				const endIndex = overtime.value.indexOf(",", startIndex);
				const snippet = overtime.value.substring(startIndex + 7, endIndex);
				dc = Number(snippet);
			}

			const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${dc} ${optionName}`;
			let saveRoll = await actor.rollAbilitySave("wis", {flavor: saveFlavor, advantage: true});
			await game.dice3d?.showForRoll(saveRoll);

			if (saveRoll.total >= dc) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
