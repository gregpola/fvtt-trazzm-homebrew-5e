const version = "10.0.0"
const optionName = "Favored Foe";
const marking = "Favored Foe Marked";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "DamageBonus") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let target = lastArg.hitTargets[0];
		let ttoken = canvas.tokens.get(target.object.id);
		
		// Make sure the actor is raging
		
		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName} - not an eligible attack`);
			return;
		}
		
		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat || isSkipThisTurn()) {
			console.log(`${optionName} - not available this attack`);
			return;
		}

		// make sure it is a foe
		let effect = target.actor.effects?.find(i=> i.label === marking && i.origin.startsWith(lastArg.actorUuid));
		if (!effect) {
			// Isn't current marked as a foe, check if there are uses remaining
			let ff = actor.items?.find(a => a.name.toLowerCase() === "favored foe");
			if (ff) {
				const usesLeft = ff.system.uses?.value;
				if (usesLeft) {
					let useFF = false;

					let content = `<div class="flexcol">
						<div class="flexrow" style="margin-bottom: 10px;"><label>Apply ${optionName} to ${target.name}?</label></div>
						<div class="flexrow"style="margin-bottom: 10px;"><label>${usesLeft} uses remaining</label></div>
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
							},
							default: "two"
						}).render(true);
					});

					useFF = await dialog;
					if (useFF) {
						await decrimentFavoredFoe(actor);
						await markAsFoe(target.uuid, lastArg.uuid);
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

		const diceMult = lastArg.isCritical ? 2: 1;
		let damageType = lastArg.itemData.system.damage.parts[0][1];
		const levels = lastArg.rollData.classes?.ranger?.levels ?? 0;

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
