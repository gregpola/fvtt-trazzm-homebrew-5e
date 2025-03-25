const version = "12.3.0";
const optionName = "Shapechanger (Yochlol)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// ask which form
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `Which form?`,
				buttons: {
					drow: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Drow.webp" width="50" height="50"/>',
						label: "<p>Female Drow</p>",
						callback: () => {
							resolve({
								name: "Female Drow",
								img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Drow.webp",
								transformActorId: "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Actor.CGc0Rgg1V1knUeQu"});
						}
					},
					spider: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-spider.webp" width="50" height="50"/>',
						label: "<p>Giant Spider</p>",
						callback: () => {
							resolve({
								name: "Giant Spider",
								img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-spider.webp",
								transformActorId: "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Actor.FdCL6zWkQCoglDjT"});
						}
					},
					cancel: {
						label: "<p>Cancel</p>",
						callback: () => { 
							resolve(null);
						}
					}
				},
				default: "cancel"
			}).render(true);
		});

		let result = await dialog;
		if (result) {
			let transformActor = await HomebrewMacros.getActorFromCompendium(result.transformActorId);

			if (transformActor) {
				const keepParameters = { keepPhysical:true, keepMental:true, keepSaves:true, keepSkills:true,
					mergeSaves:true, mergeSkills:true, keepClass:true, keepFeats:true, keepSpells:true, keepItems:false,
					keepBio:true, keepVision:true, keepSelf:true, keepAE:true, keepOriginAE:true, keepOtherOriginAE:true,
					keepSpellAE:true, keepEquipmentAE:true, keepFeatAE:true, keepClassAE:true, keepBackgroundAE:true,
					transformTokens:true };
				return actor.transformInto(transformActor, keepParameters, {renderSheet:true});
			}
			else {
				return ui.notifications.error(`${optionName}: ${version}: - missing transform actor!`);
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
