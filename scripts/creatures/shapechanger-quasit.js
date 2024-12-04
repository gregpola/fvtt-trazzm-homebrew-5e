const version = "12.3.0";
const optionName = "Shapechanger (Quasit)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const {isPolymorphed} = actor.flags?.dnd5e;
		if (isPolymorphed) {
			return ui.notifications.error(`${optionName}: ${version}: - token is already polymorphed`);
		}

		// ask which form
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `Which beast form?`,
				buttons: {
					bat: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Bat.webp" width="50" height="50"/>',
						label: "<p>Bat</p>",
						callback: () => {
							resolve({
								name: "Bat",
								transformActorId: "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Actor.SABQ5fwTw2CgT7N1",
								img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Bat.webp",
								walk: 10,
								climb: 0,
								fly: 40,
								swim: 0});
						}
					},
					centipede: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-centipede.webp" width="50" height="50"/>',
						label: "<p>Centipede</p>",
						callback: () => {
							resolve({
								name: "Centipede",
								transformActorId: "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Actor.CdD0hG0a7z6Q6Al8",
								img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-centipede.webp",
								walk: 40,
								climb: 40,
								fly: 0,
								swim: 0});
						}
					},
					toad: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-toad.jpg" width="50" height="50"/>',
						label: "<p>Toad</p>",
						callback: () => {
							resolve({
								name: "Toad",
								transformActorId: "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Actor.N8UMHxLsdnk9dmAy",
								img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-toad.jpg",
								walk: 40,
								climb: 0,
								fly: 0,
								swim: 40});
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
