const version = "0.1.0";
const optionName = "Radiant Soul";
const damageType = "fire";

try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow?.actor;
		
	if (args[0].macroPass === "DamageBonus") {
		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return;
		}

		let useFeature = false;
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} damage to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/fire/orb-vortex.webp" width="40" height="40"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="40" height="40"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});

		useFeature = await dialog;
		if (!useFeature) {
			console.log(`${optionName}: player chose to skip`);
			return;
		}

		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "geniesWrathTime");
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", "geniesWrathTime", combatTime)
		}

		const pb = actor?.data?.data?.attributes?.prof ?? 2;
		return {damageRoll: `${pb}[${damageType}]`, flavor: `${optionName} Damage`};
		
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", "geniesWrathTime");
	  if (combatTime === lastTime) {
	   console.log(`${optionName}: Already used this turn`);
	   return false;
	  }
	  
	  return true;
	}
	
	return false;
}
