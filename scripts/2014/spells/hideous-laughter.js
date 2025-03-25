/*
	A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits
	of laughter if this spell affects it. The target must succeed on a Wisdom saving throw or fall prone, becoming
	Incapacitated and unable to stand up for the Duration. A creature with an Intelligence score of 4 or less isn’t affected.

	At the end of each of its turns, and each time it takes damage, the target can make another Wisdom saving throw. The
	target has advantage on the saving throw if it’s triggered by damage. On a success, the spell ends.
*/
const version = "12.3.0";
const optionName = "Tashas Hideous Laughter";

try {
	if (args[0].macroPass === "isAttacked") {
		const tokenDistance = MidiQOL.computeDistance(token, macroItem.parent, true);
		if (tokenDistance > 5) {
			workflow.disadvantage = true;
		}
		else {
			workflow.advantage = true;
		}
	}
	else if (args[0].macroPass === "isDamaged") {
		// if the victim of the spell is damaged, they can re-save with advantage
		let effect = HomebrewHelpers.findEffect(actor, optionName);
		if (effect) {
			const dc = macroItem.parent.system.attributes.spelldc;
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
