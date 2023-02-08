const version = "10.0.0";
const optionName = "Genies Wrath";
const timeFlag = "geniesWrathTime";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
	if (args[0].macroPass === "DamageBonus") {
		// check the action type
		if (!["mwak", "rwak", "msak", "rsak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: is not an applicable action type`);
			return;
		}
			
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
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", timeFlag, combatTime)
		}

		// determine Genie Kind
		let damageType = "fire";
		if (actor.items.getName("Genie Kind - Dao")) {
			damageType = "bludgeoning";
		}
		else if (actor.items.getName("Genie Kind - Djinni")) {
			damageType = "thunder";
		}
		else if (actor.items.getName("Genie Kind - Marid")) {
			damageType = "cold";
		}
		
		const pb = actor.system.attributes.prof ?? 2;
		return {damageRoll: `${pb}[${damageType}]`, flavor: `${optionName} Damage`};
		
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
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
