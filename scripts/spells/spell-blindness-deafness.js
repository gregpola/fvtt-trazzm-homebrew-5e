/*
	You can blind or deafen a foe. Choose one creature that you can see within range to make a Constitution saving throw.
	If it fails, the target is either Blinded or Deafened (your choice) for the duration. At the end of each of its turns,
	the target can make a Constitution saving throw. On a success, the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you can target one additional
	creature for each slot level above 2nd.
*/
const version = "10.1";
const optionName = "Blindness/Deafness";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const wf = scope.workflow;
		const targets = wf.failedSaves;
		const saveDC = wf.item.system.save.dc;

		// Ask which alteration to take
		new Dialog({
			title: "Choose an Effect",
			buttons: {
				one: {
					label: "Blindness",
					callback: async () => {
						targets.forEach(target => {
							applyBlindedEffect(wf.uuid, target.actor, saveDC);
						});
					}
				},
				two: {
					label: "Deafness",
					callback: async () => {
						targets.forEach(target => {
							applyDeafenedEffect(wf.uuid, target.actor, saveDC);
						});
					}
				}
			},
		}).render(true);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyBlindedEffect(origin, target, saveDC) {

	let effectData = [{
		label: optionName,
		icon: 'icons/creatures/eyes/humanoid-single-blind.webp',
		origin: origin,
		transfer: false,
		disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 60},
		changes: [
			{ key: `flags.midi-qol.OverTime`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: `turn=end, saveAbility=con, saveDC=${saveDC}, label=Blinded`, priority: 20 },
			{ key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Blinded", priority: 21 }
		]
	}];
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}

async function applyDeafenedEffect(origin, target, saveDC) {

	let effectData = [{
		label: optionName,
		icon: 'icons/commodities/biological/shell-conch-gray.webp',
		origin: origin,
		transfer: false,
		disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 60},
		changes: [
			{ key: `flags.midi-qol.OverTime`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: `turn=end, saveAbility=con, saveDC=${saveDC}, label=Deafened`, priority: 20 },
			{ key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Deafened", priority: 21 }
		]
	}];
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}
