/*
	When you hit a creature with an attack roll, you can call on your mystical bond with nature to mark the target as
	your favored enemy for 1 minute or until you lose your concentration (as if you were concentrating on a spell).

	The first time on each of your turns that you hit the favored enemy and deal damage to it, including when you mark
	it, you can increase that damage by 1d4.

	You can use this feature to mark a favored enemy a number of times equal to your proficiency bonus, and you regain
	all expended uses when you finish a long rest.

	This feature’s extra damage increases when you reach certain levels in this class: to 1d6 at 6th level and to 1d8 at 14th level.
 */
const version = "11.0"
const optionName = "Favored Foe";
const marking = "Favored Foe Marked";

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		const targetToken = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} - not an eligible attack`);
			return;
		}

		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat || isSkipThisTurn()) {
			console.log(`${optionName} - not available this attack`);
			return;
		}

		// make sure it is a foe
		let effect = targetToken.actor.effects?.find(i=> i.label === marking && i.origin.startsWith(workflow.actorUuid));
		if (!effect) {
			// Isn't current marked as a foe, check if there are uses remaining
			let ff = actor.items?.find(a => a.name.toLowerCase() === "favored foe");
			if (ff) {
				const usesLeft = ff.system.uses?.value;
				if (usesLeft) {
					let useFF = false;

					let content = `<div class="flexcol">
						<div class="flexrow"><p>Apply ${optionName} to ${targetToken.name}?</p></div>
						<div class="flexrow" style="margin-bottom: 10px;"><p>(${usesLeft} uses remaining and requires concentration)</p></div>
					</div>`;

					let dialog = new Promise((resolve, reject) => {
						new Dialog({
							// localize this text
							title: `${optionName}`,
							content,
							buttons: {
								one: {
									icon: '<p> </p><img src = "icons/weapons/bows/longbow-recurve-leather-red.webp" width="30" height="30"></>',
									label: "<p>Yes</p>",
									callback: () => resolve(true)
								},
								two: {
									icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
									label: "<p>No</p>",
									callback: () => { resolve(false) }
								}
							}
						}).render(true);
					});

					useFF = await dialog;
					if (useFF) {
						await decrimentFavoredFoe(actor);
						await markAsFoe(targetToken.uuid, actor.uuid);
						await MidiQOL.addConcentration(actor, {item: ff, targets: [targetToken]});
					}
					else {
						await setSkipThisTurn();
						return;
					}
				}
			}
		}

		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "favoredFoeTime");
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", "favoredFoeTime", combatTime)
		}

		const diceMult = workflow.isCritical ? 2: 1;
		let damageType = workflow.item.system.damage.parts[0][1];
		const levels = actor.getRollData().classes?.ranger?.levels ?? 0;

		if (levels > 13) {
			return {damageRoll: `${diceMult}d8[${damageType}]`, flavor: `${optionName} Damage`};
		}
		else if (levels > 5) {
			return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: `${optionName} Damage`};
		}

		return {damageRoll: `${diceMult}d4[${damageType}]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}


// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "favoredFoeTime");
		if (combatTime === lastTime) {
			console.log(`${optionName} - already done favored foe damage this turn`);
			return false;
		}

		return true;
	}

	return false;
}

function isSkipThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "favoredFoeSkip");
		if (combatTime === lastTime) {
			console.log(`${optionName} - already chose to skip this turn`);
			return true;
		}
	}

	return false;
}

async function setSkipThisTurn() {
	const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	const lastTime = actor.getFlag("midi-qol", "favoredFoeSkip");
	if (combatTime !== lastTime) {
		await actor.setFlag("midi-qol", "favoredFoeSkip", combatTime)
	}
}

// Decriment available resource
async function decrimentFavoredFoe(testActor) {
	let actorDup = duplicate(testActor);
	let ff = actorDup.items?.find(a => a.name.toLowerCase() === "favored foe");
	ff.system.uses.value = ff.system.uses.value - 1;
	await testActor.update(actorDup);
}

async function markAsFoe(targetId, actorId) {
	const effectData = {
		label: `${marking}`,
		icon: "icons/weapons/bows/longbow-recurve-leather-red.webp",
		duration: {rounds: 10},
		origin: actorId,
	}
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
