/*
	A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your
	equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. The spell ends
	if you dismiss it as an action or if you cast it again.

	You can also attack with the flame, although doing so ends the spell. When you cast this spell, or as an action on a
	later turn, you can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the
	target takes 1d8 fire damage.

	This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).
*/
const version = "11.0";
const optionName = "Produce Flame";

try {
	if (args[0] === "on") {
		// add hurl flame item
		let hurlFlameItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Produce Flame - Hurl');

		const updates = {
			embedded: { Item: { ['Produce Flame - Hurl']: hurlFlameItem } }
		}
		await warpgate.mutate(token.document, updates, {}, { name: "Hurl Flame" });
	}
	else if (args[0] === "off") {
		// revert mutations
        await warpgate.revert(token.document, "Hurl Flame");
	}
		

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
