const version = "11.0"
const optionName = "Cloudkill";
const templateFlag = "cloudkill-template";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0].macroPass === "postActiveEffects") {
		
		// build the template macro
		let templateDoc = canvas.scene.collections.templates.get(workflow.templateId);
		if (!templateDoc) return;
		
		// store template id in actor to move it
		await actor.setFlag(_flagGroup, templateFlag, workflow.templateId);

		const spellLevel = workflow.castData.castLevel;
		let spelldc = actor.system.attributes.spelldc;
		let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
		await templateDoc.setFlag('world', 'spell.cloudkill', {spellLevel, spelldc, touchedTokens});
		await HomebrewMacros.cloudkillEffects(touchedTokens);
	}
	else if (args[0] === "each") {
		const templateId = actor.getFlag(_flagGroup, templateFlag);
		if (templateId) {
			let templateDoc = canvas.scene.collections.templates.get(templateId);
			if (templateDoc) {
				let newCenter = getAllowedMoveLocation(token, templateDoc, 2);
				if(!newCenter) {
					return ui.notifications.error(`${optionName} - no room to move the template`);
				}
				newCenter = canvas.grid.getSnappedPosition(newCenter.x, newCenter.y, 1);
				await templateDoc.update({x: newCenter.x, y: newCenter.y});
			}
		}
	}
	else if (args[0] === "off") {
		// delete the effects
		const templateId = actor.getFlag(_flagGroup, templateFlag);
		if (templateId) {
			await actor.unsetFlag(_flagGroup, templateFlag);
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

function getAllowedMoveLocation(casterToken, templateDoc, maxSquares) {
	let pixelsPerSquare = canvas.grid.size * 1.33; // handle diagonals
	
	for (let i = maxSquares; i > 0; i--) {
		const movePixels = i * pixelsPerSquare;
		const ray = new Ray(casterToken.center, templateDoc.object.center);
		const newCenter = ray.project((ray.distance + movePixels)/ray.distance);
		const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: templateDoc.Object});
		if(isAllowedLocation) {
			return newCenter;
		}
	}
	
	return null;
}
