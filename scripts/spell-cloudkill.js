/*
	For the template to look cool for this, add an Override in the Token Magic Template Settings:
	
	*** Ignore this ***
		Target: Cloudkill
		Inner Opacity: 0.5
		Effect Tint: #00A80B
		Special Effects: Smoky Area
		Texture: modules/tokenmagic/fx/assets/templates/black-tone-strong-opacity.png
		
*/
const version = "10.0.0"
const optionName = "Cloudkill";
const templateFlag = "cloudkill-template";
try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "postActiveEffects") {
		
		// build the template macro
		let templateDoc = canvas.scene.collections.templates.get(lastArg.templateId);
		if (!templateDoc) return;
		
		// store template it in actor to move it
		await lastArg.actor.setFlag("midi-qol", templateFlag, lastArg.templateId);
		
		let spellLevel = lastArg.spellLevel;
		let spelldc = lastArg.actor.system.attributes.spelldc;
		let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
		await templateDoc.setFlag('world', 'spell.cloudkill', {spellLevel, spelldc, touchedTokens});
		await HomebrewMacros.cloudkillEffects(touchedTokens);
	}
	else if (args[0] === "each") {
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		const templateId = lastArg.actor.getFlag("midi-qol", templateFlag);
		if (templateId) {
			let templateDoc = canvas.scene.collections.templates.get(templateId);
			if (templateDoc) {
				let newCenter = getAllowedMoveLocation(actorToken, templateDoc, 2);
				if(!newCenter) {
					return ui.notifications.error(`${optionName} - no room to move the template`);
				}
				newCenter = canvas.grid.getSnappedPosition(newCenter.x, newCenter.y, 1);
				await templateDoc.update({x: newCenter.x, y: newCenter.y});
			}
		}
	}
	else if (args[0] === "off") {
		// delete the totem
		const token = canvas.tokens.get(lastArg.tokenId);
		const templateId = token.actor.getFlag("midi-qol", templateFlag);
		if (templateId) {
			await token.actor.unsetFlag("midi-qol", templateFlag);
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

function getAllowedMoveLocation(casterToken, templateDoc, maxSquares) {
	for (let i = maxSquares; i > 0; i--) {
		const movePixels = i * canvas.grid.size;
		const ray = new Ray(casterToken.center, templateDoc.object.center);
		const newCenter = ray.project((ray.distance + movePixels)/ray.distance);
		const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: templateDoc.Object});
		if(isAllowedLocation) {
			return newCenter;
		}
	}
	
	return null;
}
