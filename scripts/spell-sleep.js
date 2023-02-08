/*
	This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (ignoring unconscious creatures).

	Starting with the creature that has the lowest current hit points, each creature affected by this spell falls Unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper awake. Subtract each creature’s hit points from the total before moving on to the creature with the next lowest hit points. A creature’s hit points must be equal to or less than the remaining total for that creature to be affected.

	Undead and creatures immune to being Charmed aren’t affected by this spell.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.
*/
const version = "10.0.0";
const optionName = "Sleep";
const gameRound = game.combat ? game.combat.round : 0;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "postActiveEffects") {
		const level = Number(lastArg.spellLevel);
		let targets = lastArg.targets;
		let totalHitPoints = lastArg.damageTotal;
		
		// sort the targets by current hp
		targets.sort((a, b)=> {	return a.actor.system.attributes.hp.value < b.actor.system.attributes.hp.value ? -1 : 1	});
		
		// apply unconscious
		let duration = 60;
		let d = lastArg.itemData.system.duration;
		if (d.units === "second") {
			duration = d.value;
		}
		else if (d.units === "minute") {
			duration = d.value * 60;
		}
		else if (d.units === "hour") {
			duration = d.value * 3600;
		}		
		
		for (let t of targets) {
			let tuuid = t.actor.uuid;
			const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Unconscious', tuuid);
			if (!hasEffectApplied) {
				let hp = t.actor.system.attributes.hp.value;
				
				if (hp <= totalHitPoints) {
					totalHitPoints -= hp;
					await game.dfreds.effectInterface.addEffect({ effectName: 'Unconscious', uuid: tuuid });
				}
				else {
					console.log(`${optionName} - ran out of affected hit points`);
					break;
				}
			}
		}		
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
