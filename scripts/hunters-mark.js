const version = "0.1.0";
let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let actor = workflow?.actor;
let target = args[0].targets[0];
let tactor = target?.actor;

try {
	// verify needed data
	if (!game.combat || !actor) {
		console.error("Missing data for Hunter's Mark");
		return;
	}
	
	if (args[0].macroPass === "preambleComplete") {
		if (!actor || !target) {
		  console.error("Hunter's Mark: no target selected");
		  return;
		}
		
		// Getting Hunter's Mark effect from actor
		let effect = actor.effects.find(i => i.data.label === "Hunter's Mark" && i.data.changes[0].key === "flags.midi-qol.HuntersMark");
		if (effect == null){ //If not active on caster
			applyHuntersMark();			
		}
		else {
			await removePriorEffect(effect);
			await applyHuntersMark();
		}
	
	}
	else if (args[0].macroPass === "DamageBonus") {
		if (!["mwak","rwak"].includes(args[0].item.data.actionType)) {
			console.log("Not an allowed attack for Hunter's Mark");
			return {};
		}

		if (!actor || !target) {
		  console.log("Hunter's Mark damage: no target selected");
		  return;
		}
		
		let effect = actor.effects.find(i => i.data.label === "Hunter's Mark" && i.data.changes.find(item => item.key === "flags.midi-qol.HuntersMark"));
		let teffect = tactor.effects.find(i => i.data.label === "Hunter's Marked" && i.data.changes.find(item => item.key === "flags.midi-qol.HuntersMarked"));
		if (effect && teffect) {
			const isMarked = (teffect.data.origin === actor.uuid);
			if (isMarked) {
				let damageType = args[0].item.data.damage.parts[0][1];
				const diceMult = args[0].isCritical ? 2: 1;
				return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: "Hunter's Mark Damage"};
			}	
		}
	}	
	
} catch (err) {
    console.error(`Hunter's Mark spell ${version}`, err);
}

// Remove the previous Hunter's Mark spell effects
async function removePriorEffect(effect) {
	let oldTarget = effect.id;
}

// Apply Hunter's Mark to the actor and target
async function applyHuntersMark() {
	// Define duration based on spell level
	let seconds = (args[0].spellLevel >= 5) ? 86400 : (args[0].spellLevel >= 3) ? 28800 : 3600;
	
	// Define effect on caster
	const effectData = [{
	  changes: [{key: "flags.midi-qol.HuntersMark", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: target.uuid, priority: 20},
		  {key: "flags.dnd5e.DamageBonusMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "ItemMacro.Hunter's Mark", priority: 21}],
	  origin: args[0].itemUuid, //flag the effect as associated to the spell being cast
	  disabled: false,
	  duration: {startTime: game.time.worldTime, seconds: seconds},
	  icon: args[0].item.img,
	  label: args[0].item.name
	}];
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: effectData });
	
	// Define effect on target
	const teffectData = [{
	  changes: [{key: "flags.midi-qol.HuntersMarked", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,value: actor.uuid, priority: 50}],
	  origin: actor.uuid, // associate it with the actor for damage application
	  disabled: false,
	  duration: {startTime: game.time.worldTime, seconds: seconds},
	  icon: args[0].item.img,
	  label: "Hunter's Marked"
	}];
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: teffectData });
}
