const version = "10.0.0";
const optionName = "Empowered Cantrips";
const timeFlag = "empoweredCantripsTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const spellLevel = lastArg.spellLevel;

		// make sure the trigger is a spell
	    if("spell" != lastArg.item.type) {
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
						icon: '<p> </p><img src = "icons/magic/fire/flame-burning-hand-white.webp" width="30" height="30"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
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
			const ability = actor.system.attributes.spellcasting;
			const abilityBonus = actor.system.abilities[ability].mod;
			let damageType = lastArg.item.system.damage.parts[0][1];
			return {damageRoll: `${abilityBonus}[${damageType}]`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}	
	return false;
}
