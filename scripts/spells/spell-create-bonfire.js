/*
	You create a bonfire on ground that you can see within range. Until the spell ends, the magic bonfire fills a 5-foot cube. Any creature in the bonfire’s space when you cast the spell must succeed on a Dexterity saving throw or take 1d8 fire damage. A creature must also make the saving throw when it moves into the bonfire’s space for the first time on a turn or ends its turn there.

	The bonfire ignites flammable objects in its area that aren’t being worn or carried.

	The spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).
*/
const version = "10.0.2";
const optionName = "Create Bonfire";
const templateFlag = "create-bonfire-template";
const ambientLightFlag = "create-bonfire-light";

try {
	const lastArg = args[args.length - 1];
	let caster = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postActiveEffects") {
		// build the template macro
		let templateDoc = canvas.scene.collections.templates.get(lastArg.templateId);
		if (!templateDoc) return;

		// store the spell data in the template
		const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
		const cantripDice = 1 + Math.floor((characterLevel + 1) / 6);
		let spelldc = lastArg.actor.system.attributes.spelldc;
		let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
		await templateDoc.setFlag('world', 'spell.CreateBonfire', {cantripDice, spelldc, touchedTokens});
		await HomebrewMacros.createBonfireEffects(touchedTokens);
		
		// add ambient light
		let lightDoc = await canvas.scene.createEmbeddedDocuments("AmbientLight", [{
			t: "l", // l for local. The other option is g for global.
			x: templateDoc.x, // horizontal positioning
			y: templateDoc.y, // vertical positioning
			rotation: 0, // the beam direction of the light in degrees (if its angle is less than 360 degrees.) 
			config: { 
				dim: 40, // the total radius of the light, including where it is dim.
				bright: 20, // the bright radius of the light
				angle: 360, // the coverage of the light. (Try 30 for a "spotlight" effect.)
							// Oddly, degrees are counted from the 6 o'clock position.
				color: "#D97E57", // Light coloring.
				alpha: 0.5
			} // Light opacity (or "brightness," depending on how you think about it.) 
		}]);
		
		await actor.setFlag("midi-qol", ambientLightFlag, lightDoc[0].id);
	
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
