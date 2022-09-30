const version = "0.1.0"
const marking = "Favored Foe Marked";
try {
	// Watch for a hit
	if (args[0].hitTargets.length === 0) return;

	let target = args[0].hitTargets[0].data.actorData;
	let actor = await MidiQOL.MQfromActorUuid(args[0].actorUuid); // actor who cast the spell

	if (!actor || !target) {
		console.log("Favored Foe: no token/target selected");
		return;
	}
	
	// make sure it's an allowed attack
	if (!["mwak","rwak"].includes(args[0].item.data.actionType)) {
		console.log("Favored Foe: not an eligible attack");
		return;
	}
	
	// Check for availability i.e. once per actors turn
	if (!isAvailableThisTurn() || !game.combat || isSkipThisTurn()) {
		return;
	}

	// make sure it is a foe
	let effect = target.effects?.find(i=> i.label === marking && i.origin.startsWith(args[0].actorUuid));
	if (!effect) {
		// Isn't current marked as a foe, check if there are uses remaining
		let ff = actor.data.items?.find(a => a.name.toLowerCase() === "favored foe");
		if (ff) {
			const usesLeft = ff.data?.data?.uses?.value;
			
			if (usesLeft) {
				let useFF = false;
				let dialog = new Promise((resolve, reject) => {
					new Dialog({
						// localize this text
						title: "Ranger: Favored Foe",
						content: "<p>Use Favored Foe?</p>",
						buttons: {
							one: {
								icon: '<p> </p><img src = "icons/weapons/bows/longbow-recurve-leather-red.webp" width="60" height="60"></>',
								label: "<p>Yes</p>",
								callback: () => resolve(true)
							},
							two: {
								icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="60" height="60"></>',
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
					await markAsFoe(args[0].hitTargets[0].uuid, args[0].uuid);
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

	const diceMult = args[0].isCritical ? 2: 1;
	let damageType = args[0].item.data.damage.parts[0][1];
	const levels = args[0].rollData.classes?.ranger?.levels ?? 0;

	if (levels > 13) {
		return {damageRoll: `${diceMult}d8[${damageType}]`, flavor: "Favored Foe Damage"};
	}
	else if (levels > 5) {
		return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: "Favored Foe Damage"};
	}

	return {damageRoll: `${diceMult}d4[${damageType}]`, flavor: "Favored Foe Damage"};
		
} catch (err) {
    console.error(`${args[0].itemData.name} - Favored Foe ${version}`, err);
}


// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", "favoredFoeTime");
	  if (combatTime === lastTime) {
	   console.log("Favored Foe Damage: Already done favored foe damage this turn");
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
	   console.log("Favored Foe: Already chose to skip this turn");
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
	ff.data.uses.value = ff.data.uses.value - 1;
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
