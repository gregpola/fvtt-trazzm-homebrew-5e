const version = "12.3.0"
const optionName = "Cloudkill";
const templateFlag = "cloudkill-template";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const movedFlag = "moved-cloudkill-flag";

try {
	if (args[0].macroPass === "postActiveEffects") {
		await HomebrewHelpers.storeSpellDataInRegion(workflow.templateId, token, workflow.castData.castLevel, templateFlag, 'spell.Cloudkill');
	}
	else if (args[0] === "each") {
		if (HomebrewHelpers.isAvailableThisTurn(actor, movedFlag)) {
			HomebrewHelpers.setUsedThisTurn(actor, movedFlag);

			const templateId = actor.getFlag(_flagGroup, `${templateFlag}.templateId`);
			if (templateId) {
				let templateDoc = await fromUuid(templateId);
				if (templateDoc) {
					let newCenter = getAllowedMoveLocation(token, templateDoc, 2);
					if (!newCenter) {
						return ui.notifications.error(`${optionName} - no room to move the template`);
					}
					newCenter = canvas.grid.getSnappedPosition(newCenter.x, newCenter.y, 1);
					await templateDoc.update({x: newCenter.x, y: newCenter.y});
				}
			}
		}
	}
	else if (args[0] === "off") {
		// delete the actor flag
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
