/*
	At 8th level, you gain the ability to infuse your weapon strikes with the fiery power of the forge. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 fire damage to the target. When you reach 14th level, the extra damage increases to 2d8.
*/
const version = "10.0.0";
const optionName = "Divine Strike (Forge Domain)";
const timeFlag = "divineStrikeForgeDomain";
const damageType = game.i18n.localize("fire");

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available this turn`);
			return;
		}

		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/weapons/swords/sword-gold-holy.webp" width="50" height="50"></>',
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
			const clericLevel = actor.classes.cleric?.system.levels ?? 0;
			const levelMulti = clericLevel > 13 ? 2 : 1;
			const critMulti = lastArg.isCritical ? 2: 1;
			const totalDice = levelMulti * critMulti;
			return {damageRoll: `${totalDice}d8[${damageType}]`, flavor: optionName};
		}
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}	
	return false;
}
