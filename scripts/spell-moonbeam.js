/*
	A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range. Until the spell ends, dim light fills the cylind⁠er.

	When a creature enters the spell’s area for the first time on a turn or starts its turn there, it is engulfed in ghostly flames that cause searing pain, and it must make a Constitution saving throw. It takes 2d10 radiant damage on a failed save, or half as much damage on a successful one.

	A Shapechanger makes its saving throw with disadvantage. If it fails, it also instantly reverts to its original form and can’t assume a different form until it leaves the spell’s light.

	On each of your turns after you cast this spell, you can use an action to move the beam up to 60 feet in any direction.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d10 for each slot level above 2nd.
*/
const version = "10.0.2";
const optionName = "Moonbeam";
const templateFlag = "moonbeam-template";
const ambientLightFlag = "moonbeam-light";

try {
	const lastArg = args[args.length - 1];
	let caster = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postActiveEffects") {
		// build the template macro
		let templateDoc = canvas.scene.collections.templates.get(lastArg.templateId);
		if (!templateDoc) return;
		
		// add ambient light
		let lightDoc = await canvas.scene.createEmbeddedDocuments("AmbientLight", [{
			t: "l", // l for local. The other option is g for global.
			x: templateDoc.x, // horizontal positioning
			y: templateDoc.y, // vertical positioning
			rotation: 0, // the beam direction of the light in degrees (if its angle is less than 360 degrees.) 
			config: { 
				dim: 15, // the total radius of the light, including where it is dim.
				bright: 0, // the bright radius of the light
				angle: 360, // the coverage of the light. (Try 30 for a "spotlight" effect.)
							// Oddly, degrees are counted from the 6 o'clock position.
				color: "#AED9D5", // Light coloring.
				alpha: 0.5
			} // Light opacity (or "brightness," depending on how you think about it.) 
		}]);
		
		const ambientLightId = lightDoc[0].id;
		await actor.setFlag("midi-qol", ambientLightFlag, ambientLightId);

		// store the spell data in the template
		let spellLevel = lastArg.spellLevel;
		let spelldc = lastArg.actor.system.attributes.spelldc;
		let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
		await templateDoc.setFlag('world', 'spell.Moonbeam', {spellLevel, spelldc, touchedTokens, ambientLightId});
		await HomebrewMacros.moonbeamEffects(touchedTokens);
	}
	else if (args[0] === "off") {
		// delete the ambient light effect
		const lightDocId = actor.getFlag("midi-qol", ambientLightFlag);
		if (lightDocId) {
			await actor.unsetFlag("midi-qol", ambientLightFlag);
			// delete the ambient light
			let delDoc = await canvas.scene.deleteEmbeddedDocuments("AmbientLight", [lightDocId]);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
