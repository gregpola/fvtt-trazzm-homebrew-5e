/*
You have achieved a penetrating precision in combat, granting you the following benefits:

	* Increase your Strength or Dexterity by 1, to a maximum of 20.

	* Once per turn, when you hit a creature with an attack that deals piercing damage, you can reroll one of the attack’s damage dice, and you must use the new roll.

	* When you score a critical hit that deals piercing damage to a creature, you can roll one additional damage die when determining the extra piercing damage the target takes.

*/
const version = "12.3.0";
const optionName = "Piercer";
const timeFlag = "piercerTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		// make sure it's an allowed attack
		if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} not allowed: not an attack`);
			return {};
		}
		
		if (workflow.damageDetail.filter(i=>i.type === "piercing").length < 1) {
			console.log(`${optionName} not allowed: not piercing damage`);
			return {};
		}

		let piercingIndex = -1;
		for (let i = 0; i < workflow.damageDetail.length; i++) {
			if (workflow.damageDetail[i].type === "piercing") {
				piercingIndex = i;
				break;
			}
		}

		if (piercingIndex < 0) {
			return {};
		}

		var found = false;
		var roll = {};
		let damageRoll = workflow.damageRolls[piercingIndex];
		for (i = 0; i < damageRoll.terms.length; i++) {
			if (!isNaN(damageRoll.terms[i].faces)) {
				roll.die = damageRoll.terms[i].faces;
				roll.result = damageRoll.terms[i].results[0].result;
				found = true;
				break;
			}
		}

		if (!found) {
			return {};
		}

		// ask if the actor wants to re-roll a damage die
		// Check for availability i.e. once per actors turn
		let rerollDamageTerm = "";
		if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: "Piercer Reroll",
					content: `<p>Use Piercer Reroll on ` + roll.result + ` on a d` + roll.die + '?',
					buttons: {
						one: {
							icon: '<i class="fas fa-check"></i>',
							label: "Confirm",
							callback: () => resolve(true)
						},
						two: {
							icon: '<i class="fas fa-times"></i>',
							label: "Cancel",
							callback: () => { resolve(false) }
						}
					},
					default: "two"
				}).render(true);
			});
			
			let usePiercerReroll = await dialog;
			if (usePiercerReroll) {
				let newRoll = await new Roll(`1d${roll.die}`).evaluate();
				await game.dice3d?.showForRoll(newRoll);
				let damageDiff = (newRoll.total - roll.result);
				rerollDamageTerm = `${damageDiff}`;
				await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
			}
		}
		
		// if a critical add extra damage die
		if (workflow.isCritical) {
			if (rerollDamageTerm.length > 0) {
				return {damageRoll: `1d${roll.die}+${rerollDamageTerm}[piercing]`, flavor: `${optionName} Damage`};
			}
			else {
				return {damageRoll: `1d${roll.die}[piercing]`, flavor: `${optionName} Damage`};
			}
		}
		else if (rerollDamageTerm.length > 0) {
			return {damageRoll: `${rerollDamageTerm}[piercing]`, flavor: `${optionName} Damage`};
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
