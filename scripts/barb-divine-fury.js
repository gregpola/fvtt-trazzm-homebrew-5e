const version = "0.1.0";
const optionName = "Divine Fury";
const rageEffectName = "Rage";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let target = args[0].hitTargets[0];
		let tactor = target?.actor;

		// must be raging
		if (!hasEffectApplied(rageEffectName, actor)) {
		console.log(`$(optionName} : not allowed, not raging`);
			return;
		}
		
		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak","rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// make sure it hasn't been used this turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return;
		}

		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "divineFuryTime");
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", "divineFuryTime", combatTime)
		}

		const diceMult = args[0].isCritical ? 2: 1;
		const barbarianLevel = actor.classes?.barbarian?.data?.data?.levels ?? 0;
		const bonus = Math.ceil(barbarianLevel/2);
		return {damageRoll: `${diceMult}d6+${bonus}[radiant]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
    console.error(`Combat Maneuver: ${optionName} ${version}`, err);
}

function hasEffectApplied(effectName, actor) {
  return actor.effects.find((ae) => ae.data.label === effectName) !== undefined;
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", "divineFuryTime");
	  if (combatTime === lastTime) {
	   console.log(`${optionName}: Already used this turn`);
	   return false;
	  }
	  
	  return true;
	}
	
	return false;
}
