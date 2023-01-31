/*
You have achieved a penetrating precision in combat, granting you the following benefits:

	* Increase your Strength or Dexterity by 1, to a maximum of 20.

	* Once per turn, when you hit a creature with an attack that deals piercing damage, you can reroll one of the attack’s damage dice, and you must use the new roll.

	* When you score a critical hit that deals piercing damage to a creature, you can roll one additional damage die when determining the extra piercing damage the target takes.

*/
const version = "10.0.0";
const optionName = "Piercer";
const lastArg = args[args.length - 1];

try {
	if (lastArg.macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);

		// make sure it's an allowed attack
		if (!["msak", "rsak", "mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName} not allowed: not an attack`);
			return;
		}
		
		if (workflow.damageDetail.filter(i=>i.type === "piercing").length < 1) {
			console.log(`${optionName} not allowed: not piercing damage`);
			return;
		}

		// get the die roll data
		var dieRolls = [];
		var terms = lastArg.damageRoll.terms;
		
		for (i = 0; i < terms.length; i++) {
			if (isNaN(terms[i].faces)) continue;
			if (terms[i].options.flavor != "piercing") continue;
			
			for (var j = 0; j < terms[i].results.length; j++) {
				var roll = {};
				roll.die = terms[i].faces;
				roll.result = terms[i].results[j].result;
				roll.ratio = roll.result / roll.die;
				dieRolls.push(roll);
			}
		}
		
		dieRolls.sort(piercerSortRolls);
		if (dieRolls.length == 0) return {};
		
		// ask if the actor wants to re-roll a damage die
		// Check for availability i.e. once per actors turn
		let rerollDamageTerm = "";
		if (isAvailableThisTurn() && game.combat) {
			const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
			
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: "Piercer Reroll",
					content: `<p>Use Piercer Reroll on ` + dieRolls[0].result + ` on a d` + dieRolls[0].die + '?',
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
				await actor.setFlag('midi-qol', 'piercerTime', `${combatTime}`);
				let newRoll = (new Roll(`1d${dieRolls[0].die}`).evaluate({ async: false }));
				await game.dice3d?.showForRoll(newRoll);
				let damageDiff = (newRoll.total - dieRolls[0].result);
				rerollDamageTerm = `${damageDiff}`;
			}
		}
		
		// if a critical add extra damage die
		if (workflow.isCritical) {
			if (rerollDamageTerm.length > 0) {
				return {damageRoll: `1d${dieRolls[0].die}+${rerollDamageTerm}[piercing]`, flavor: `${optionName} Damage`};
			}
			else {
				return {damageRoll: `1d${dieRolls[0].die}[piercing]`, flavor: `${optionName} Damage`};
			}
		}
		else if (rerollDamageTerm.length > 0) {
			return {damageRoll: `${rerollDamageTerm}[piercing]`, flavor: `${optionName} Damage`};
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "piercerTime");
		if (combatTime === lastTime) {
			return false;
		}
		
		return true;
	}
	return false;
}

function piercerSortRolls(a, b) {
	// sort rolls by die size and then 
	if ((b.die - a.die) != 0) {
		return b.die - a.die;
	}
	return a.ratio - b.ratio;
}
