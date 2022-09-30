const version = "0.1.0";
let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let actor = workflow?.actor;

try {
	// verify needed data
	if (!game.combat || !actor) {
		console.error("Missing data for Hunter's Mark");
		return;
	}
	
	if (args[0].macroPass === "preambleComplete") {
		let target = args[0].targets[0];
		let tactor = target?.actor;
		if (!actor || !target) {
		  console.error("Hunter's Mark: no target selected");
		  return;
		}

		// Getting Hunter's Mark effect from actor
		let effect = actor.effects.find(i => i.data.label === "Hunter's Mark" && i.data.changes.find(i => i.key === "flags.midi-qol.HuntersMark"));
		if (effect != null){			
			// Define duration based on spell level
			const oldDuration = effect.duration;
			
			// update effect on actor
			let effectChanges = effect.data.changes.filter(item => item.key !== "flags.midi-qol.HuntersMark");
			effectChanges.push({ key: "flags.midi-qol.HuntersMark", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: target.uuid, priority: 20 });
			let effectData = [{
				_id: effect.id,
				changes: effectChanges
			}];
			await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: actor.uuid, updates: effectData });
			
			// Define effect on target
			const teffectData = [{
			  changes: [{key: "flags.midi-qol.HuntersMarked", mode: 5,value: true, priority: 50}],
			  origin: actor.uuid, // associate it with the actor for damage application
			  disabled: false,
			  duration: oldDuration,
			  icon: effect.data.icon,
			  label: "Hunter's Marked"
			}];
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: teffectData });
			
		}
	}
	
} catch (err) {
    console.error(`Apply Hunter's Mark ${version}`, err);
}
