const version = "0.1.0";
const optionName = "Empowered Cantrips";
const timeFlag = "empoweredCantripsTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const lastArg = args[args.length - 1];
		let spellLevel = lastArg.spellLevel;

		// make sure the trigger is a spell
	    if("spell" != args[0].item.type) {
			console.log(`${optionName}: not a spell`);
			return {};
		}
		
		// make sure it is a cantrip?
		if (spellLevel > 0) {
			console.log(`${optionName}: not a cantrip`);
			return {};
		}		

		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return;
		}

		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} to this casting?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/fire/flame-burning-hand-white.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
			const lastTime = actor.getFlag("midi-qol", timeFlag);
			if (combatTime !== lastTime) {
				await actor.setFlag("midi-qol", timeFlag, combatTime)
			}
			
			// add damage bonus
			const ability = actor.data.data.attributes.spellcasting;
			const abilityBonus = actor.data.data.abilities[ability].mod;
			let damageType = args[0].item.data.damage.parts[0][1];
			return {damageRoll: `${abilityBonus}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", timeFlag);
	  if (combatTime === lastTime) {
	   console.log(`${optionName}: Already used this turn`);
	   return false;
	  }
	  
	  return true;
	}
	
	return false;
}
