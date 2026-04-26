/*
	When the fungus queen takes damage from a weapon attack, adjacent creatures are blanketed with a cloud of spores.
	Creatures must succeed on a DC 18 Constitution saving throw or become blinded for 1 round. If the queen dies, its
	body bursts into fungal spores in a 30-foot-radius sphere, leaving behind only equipment the queen was wearing or
	carrying. New fungal growths sprout in the area of a queen's demise
*/
const optionName = "Spore Burst";
const version = "13.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "rwak", "natural"].includes(rolledActivity.actionType)) {
            // trigger save activity
            let activity = macroItem.system.activities.find(a => a.identifier === 'spore-burst-save');
            if (activity) {
                await activity.use();
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
