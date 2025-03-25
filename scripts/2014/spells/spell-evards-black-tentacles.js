/*
	Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the Duration, these tentacles turn the ground in the area into difficult terrain.

	When a creature enters the affected area for the first time on a turn or starts its turn there, the creature must succeed on a Dexterity saving throw or take 3d6 bludgeoning damage and be Restrained by the tentacles until the spell ends. A creature that starts its turn in the area and is already restrai⁠ned by the tentacles takes 3d6 bludgeoning damage.

	A creature restrained by the tentacles can use its action to make a Strength or D⁠exterity check (its choice) against your spell save DC. On a success, it frees itself.	
*/
const version = "10.0.0"
const optionName = "Evard's Black Tentacles";

try {
	const lastArg = args[args.length - 1];
	const token = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postActiveEffects") {
		// build the template macro
		let templateDoc = canvas.scene.collections.templates.get(lastArg.templateId);
		if (!templateDoc) return;
		
		let spellLevel = lastArg.spellLevel;
		let spelldc = lastArg.actor.system.attributes.spelldc;
		let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
		await templateDoc.setFlag('world', 'spell.evardsblacktentacles', {spellLevel, spelldc, touchedTokens});
		await HomebrewMacros.evardsBlackTentaclesEffects(touchedTokens, true);
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
