/*
	A dazzling array of flashing, colored light springs from your hand. Roll 6d10; the total is how many hit points of
	creatures this spell can affect. Creatures in a 15-foot cone originating from you are affected in ascending order of
	their current hit points (ignoring Unconscious creatures and creatures that can't see).

	Starting with the creature that has the lowest current hit points, each creature affected by this spell is Blinded
	until the end of your next turn. Subtract each creature's hit points from the total before moving on to the creature
	with the next lowest hit points. A creature's hit points must be equal to or less than the remaining total for that
	creature to be affected.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d10 for
	each slot level above 1st.
*/
const version = "12.3.0";
const optionName = "Color Spray";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let totalHitPoints = workflow.damageTotal;
		
		// sort the targets by current hp
		const sortedTargets = Array.from(workflow.targets).sort((a, b) =>  a.actor.system.attributes.hp.value - b.actor.system.attributes.hp.value);

		// apply effect in order of lowest to highest hp until all points are spent
		for (let t of sortedTargets) {
			let hp = t.actor.system.attributes.hp.value;

			if (hp <= totalHitPoints) {
				totalHitPoints -= hp;
				await HomebrewEffects.applyBlindedEffect(t.actor, item.uuid, ['turnEndSource']);
			} else {
				console.log(`${optionName} - ran out of affected hit points`);
				break;
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
