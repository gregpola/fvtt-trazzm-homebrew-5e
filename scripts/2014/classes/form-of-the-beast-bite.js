/*
	Your mouth transforms into a bestial muzzle or great mandibles (your choice). It deals 1d8 piercing damage on a hit. Once on each of your turns when you damage a creature with this bite, you regain a number of hit points equal to your proficiency bonus, provided you have less than half your hit points when you hit.
*/
const version = "10.0.0";
const optionName = "Beast Bite";
const timeFlag = "beast-bite-time";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const sourceItem = fromUuid(lastArg.sourceItemUuid);
		
		// make sure the actor is raging
		if (!hasEffectApplied("Rage", actor)) {
			console.log(`${optionName}: not raging`);
			return {};
		}

		// make sure it's a beast bite attack
		if (lastArg.item.name != optionName) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}
		
		// Check for availability i.e. first hit on the actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName} - not available this attack`);
			return {};
		}
		
		// make sure the actor has half their hp total
		let half = Math.ceil(actor.system.attributes.hp.max / 2);
		if (actor.system.attributes.hp.value >= half) {
			console.log(`${optionName} - not available, too many hp`);
			return {};
		}

		// heal the barbarian
		const pb = actor.system.attributes.prof;
		await MidiQOL.applyTokenDamage(
			[{ damage: pb, type: 'healing' }],
			pb,
			new Set([actorToken]),
			lastArg.item,
			null
		);
		
		// set the time flag
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", timeFlag, combatTime)
		}
	}

} catch (err) {
    console.error(`Combat Maneuver: ${optionName} ${version}`, err);
}

function hasEffectApplied(effectName, actor) {
  return actor.effects.find((ae) => ae.label === effectName) !== undefined;
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", timeFlag);
	  if (combatTime === lastTime) {
		  console.log(`${optionName}: already used this turn`);
		  return false;
	  }	  
	  return true;
	}
	
	return false;
}
