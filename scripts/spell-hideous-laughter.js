/*
	A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits
	of laughter if this spell affects it. The target must succeed on a Wisdom saving throw or fall prone, becoming
	Incapacitated and unable to stand up for the Duration. A creature with an Intelligence score of 4 or less isn’t affected.

	At the end of each of its turns, and each time it takes damage, the target can make another Wisdom saving throw. The
	target has advantage on the saving throw if it’s triggered by damage. On a success, the spell ends.
*/
const version = "10.1";
const optionName = "Blindness/Deafness";

try {
	const wf = scope.workflow;

	if (args[0].macroPass === "postActiveEffects") {
		const saveDC = wf.item.system.save.dc;
		const targets = wf.failedSaves;

		targets.forEach(target => {
			applyLaughterEffect(actor.uuid, target.actor, saveDC);
		});
	}
	else if (args[0].macroPass === "isDamaged") {
		// if the victim of the spell is damaged, they can re-save with advantage
		let target = wf.targets.first();
		let effect = target.actor.effects.find(i=>i.label === optionName);
		if (effect) {
			let dc = 13; // TODO find the DC in the overtime
			const overtime = effect.changes.find(i => i.key === 'flags.midi-qol.OverTime');
			if (overtime) {
				const startIndex = overtime.value.indexOf("saveDC=");
				const endIndex = overtime.value.indexOf(",", startIndex);
				const snippet = overtime.value.substring(startIndex + 7, endIndex);
				dc = Number(snippet);
			}

			const saveFlavor = `${CONFIG.DND5E.abilities["wis"]} DC${dc} ${optionName}`;
			let saveRoll = await target.actor.rollAbilitySave("wis", {flavor: saveFlavor, advantage: true});
			await game.dice3d?.showForRoll(saveRoll);

			if (saveRoll.total >= dc) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [effect.id] });
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyLaughterEffect(origin, target, saveDC) {
	let effectData = [{
		label: optionName,
		icon: 'icons/creatures/eyes/humanoid-single-blind.webp',
		origin: origin,
		transfer: false,
		disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 60},
		changes: [
			{ key: `flags.midi-qol.OverTime`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: `turn=end, saveAbility=wis, saveDC=${saveDC}, label=Laughing`, priority: 20 },
			{ key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Incapacitated", priority: 21 },
			{ key: `flags.midi-qol.onUseMacroName`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "ItemMacro.Compendium.fvtt-trazzm-homebrew-5e.homebrew-spells.nrHIlA7oiYs2LZwr, isDamaged", priority: 22 }
		]
	}];
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}
