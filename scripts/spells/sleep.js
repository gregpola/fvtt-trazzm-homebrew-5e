/*
	This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell
	can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their
	current hit points (ignoring unconscious creatures).

	Starting with the creature that has the lowest current hit points, each creature affected by this spell falls
	Unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper
	awake. Subtract each creature’s hit points from the total before moving on to the creature with the next lowest hit
	points. A creature’s hit points must be equal to or less than the remaining total for that creature to be affected.

	Undead and creatures immune to being Charmed aren’t affected by this spell.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.
*/
const version = "12.3.1";
const optionName = "Sleep";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Get the total hp
		const spellLevel = workflow.castData?.castLevel ?? 1;
		let diceCount = 5 + (2 * (spellLevel - 1));
		let effectRoll = await new Roll(`${diceCount}d8`).evaluate();
		await game.dice3d?.showForRoll(effectRoll);
		let totalHitPoints = effectRoll.total;

		// sort the targets by current hp
		let sortedTargets = [];
		sortedTargets = Array.from(workflow.targets);
		sortedTargets.sort((a, b)=> {	return a.actor.system.attributes.hp.value < b.actor.system.attributes.hp.value ? -1 : 1	});
		
		// determine the duration in seconds
		let duration = 60;
		let d = item.system.duration;
		if (d.units === "second") {
			duration = d.value;
		}
		else if (d.units === "minute") {
			duration = d.value * 60;
		}
		else if (d.units === "hour") {
			duration = d.value * 3600;
		}

		for (let target of sortedTargets) {
			// skip undead
			if (target.actor.system.details.type.value === "undead")
				continue;

			// skip targets immune to being charmed
			if (HomebrewHelpers.hasConditionImmunity(target.actor, "charmed"))
				continue;

			// skip if already asleep or unconscious
			if (!target.actor.statuses.has("unconscious") && !target.actor.statuses.has("dead") && !target.actor.statuses.has("sleeping")) {
				let hp = target.actor.system.attributes.hp.value;
				if (hp < 1) continue;

				if (hp <= totalHitPoints) {
					totalHitPoints -= hp;
					await HomebrewEffects.applySleepingEffect(target.actor, workflow.item.uuid);
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
