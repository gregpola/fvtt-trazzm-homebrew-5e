/*
	After drinking this potion, you can use a bonus action to exhale fire at a target within 30 feet of you. The target
	must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a
	successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.

	This potion's orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.
*/
const version = "12.3.0";
const optionName = "Potion of Fire Breath";

const breathAttackName = "Potion of Fire Breath Attack";
const breathAttackId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.sCdzoeVzvx2UQCsm";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let breathAttackItem = await fromUuid(breathAttackId);
		await actor.createEmbeddedDocuments('Item',[breathAttackItem]);
		favoriteItem = actor.items.find(i => i.name === breathAttackName);
		if (favoriteItem) {
			await HomebrewHelpers.addFavorite(actor, favoriteItem);
		}
	}
	else if (args[0] === "off") {
		const item = actor.items.find(i => i.name === breathAttackName);
		if (item) {
			await actor.deleteEmbeddedDocuments('Item', [item.id]);
		}
	}

} catch (err) {
    console.error(`${optionName} v${version}`, err);
}
