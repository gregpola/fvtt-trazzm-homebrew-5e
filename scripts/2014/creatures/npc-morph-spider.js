const version = "12.3.0";
const optionName = "NPC Morph (Spider)";
const transformActorName = "Giant Spider";
const transformActorId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Actor.FdCL6zWkQCoglDjT";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const {isPolymorphed} = actor.flags?.dnd5e;
		if (!isPolymorphed) {
			let transformActor = await HomebrewMacros.getActorFromCompendium(transformActorId);

			if (transformActor) {
				const keepParameters = { keepPhysical:false, keepMental:true, keepSaves:true, keepSkills:true,
					mergeSaves:true, mergeSkills:true, keepClass:true, keepFeats:true, keepSpells:true, keepItems:false,
					keepBio:false, keepVision:false, keepSelf:true, keepAE:true, keepOriginAE:true, keepOtherOriginAE:true,
					keepSpellAE:true, keepEquipmentAE:true, keepFeatAE:true, keepClassAE:true, keepBackgroundAE:true,
					transformTokens:true };
				return actor.transformInto(transformActor, keepParameters, {renderSheet:true});
			}
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
