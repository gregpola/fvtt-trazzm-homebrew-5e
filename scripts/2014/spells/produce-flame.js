/*
	A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your
	equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. The spell ends
	if you dismiss it as an action or if you cast it again.

	You can also attack with the flame, although doing so ends the spell. When you cast this spell, or as an action on a
	later turn, you can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the
	target takes 1d8 fire damage.

	This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).
*/
const version = "12.3.0";
const optionName = "Produce Flame";
const hurlItemName = "Flickering Flame";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let compendiumItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', hurlItemName);
		let hurlItems = await actor.createEmbeddedDocuments("Item", [compendiumItem]);

		// update hurl flame item
		const casterLevel = HomebrewHelpers.getLevelOrCR(actor);
		if (hurlItems[0]) {
			let hurlItem = hurlItems[0];
			const damageDice = Math.floor((casterLevel + 1) / 6) + 1;

			// update the damage
			let damageParts = hurlItem.system.damage.parts;
			damageParts[0][0] = `${damageDice}d8`;
			await hurlItem.update({"system.damage.parts": damageParts, "system.equipped" : true});

			// set the flag so our automation knows this is a cantrip
			await hurlItem.setFlag(_flagGroup, 'spell-level', 0);

			await HomebrewHelpers.addFavorite(actor, hurlItem);
		}
		else {
			ui.notifications.error(`${optionName}: ${version} - unable to find the ${hurlItemName} on ${actor.name}`);
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
