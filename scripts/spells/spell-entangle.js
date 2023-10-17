/*
	Grasping weeds and vines sprout from the ground in a 20-foot square starting from a point within range. For the Duration, these Plants turn the ground in the area into difficult terrain.

	A creature in the area when you cast the spell must succeed on a Strength saving throw or be Restrained by the entangling Plants until the spell ends. A creature restra⁠ined by the plant⁠s can use its action to make a Stren⁠gth check against your spell save DC. On a success, it frees itself.

	When the spell ends, the conjured Plants wilt away.
*/
const version = "10.1";
const optionName = "Entangle";
const flagName = "entangle-targets";
		
try {
	if (args[0].macroPass === "postActiveEffects") {
		if (workflow.failedSaves.size > 0) {
			// add restrained to the targets that failed their save
			const saveDC = actor.system.attributes.spelldc;
			for(let target of workflow.failedSaves) {
				await HomebrewMacros.applyRestrained(token, target, saveDC, "str");
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
