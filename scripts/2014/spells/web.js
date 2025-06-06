/*
	You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube
	from that point for the Duration. The webs are difficult terrain and lightly obscure their area.

	If the webs aren’t anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or
	ceiling, the conjured web collapses on itself, and the spell ends at the start of your next turn. Webs layered over
	a flat surface have a depth of 5 feet.

	Each creature that starts its turn in the webs or that enters them during its turn must make a Dexterity saving
	throw. On a failed save, the creature is Restrained as long as it remains in the webs or until it breaks free.

	A creature Restrained by the webs can use its action to make a Strength check against your spell save DC. If it
	succeeds, it is no longer Restrained.

	The webs are flammable. Any 5-foot cube of webs exposed to fire burns away in 1 round, dealing 2d4 fire damage to
	any creature that starts its turn in the fire.
*/
const version = "12.3.0";
const optionName = "Web";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the template
		let templateDoc = canvas.scene.collections.templates.get(workflow.templateId);
		if (templateDoc) {
			const spellRegionId = templateDoc.flags['region-attacher']?.attachedRegion;
			if (spellRegionId) {
				const spellRegion = canvas.scene?.regions?.get(spellRegionId.substring(spellRegionId.lastIndexOf(".") + 1));
				if (spellRegion) {
					// store the spell data in the region
					const actorDC = actor.system.attributes.spelldc ?? 12;
					await spellRegion.setFlag('world', 'spell.Web', {
						saveDC: actorDC,
						spellId: item.id,
						sourceTokenId: token.id,
						itemCardId: args[0].itemCardId
					});
				}
			}
		}
	}
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
