/*
	A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range.
	Until the spell ends, dim light fills the cylinder.

	When a creature enters the spell’s area for the first time on a turn or starts its turn there, it is engulfed in
	ghostly flames that cause searing pain, and it must make a Constitution saving throw. It takes 2d10 radiant damage
	on a failed save, or half as much damage on a successful one.

	A Shapechanger makes its saving throw with disadvantage. If it fails, it also instantly reverts to its original form
	and can’t assume a different form until it leaves the spell’s light.

	On each of your turns after you cast this spell, you can use an action to move the beam up to 60 feet in any direction.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d10 for each slot level above 2nd.
*/
const version = "12.3.0";
const optionName = "Moonbeam";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "moonbeam-flag";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the template
		let templateDoc = canvas.scene.collections.templates.get(workflow.templateId);
		if (templateDoc) {
			const moonbeamRegionId = templateDoc.flags['region-attacher']?.attachedRegion;
			if (moonbeamRegionId) {
				const moonbeamRegion = canvas.scene?.regions?.get(moonbeamRegionId.substring(moonbeamRegionId.lastIndexOf(".") + 1));
				if (moonbeamRegion) {
					// store the spell data in the region
					const spellLevel = workflow.castData.castLevel;
					const damageRoll = spellLevel + 'd10';
					const spelldc = actor.system.attributes.spelldc ?? 12;
					let damageType = 'radiant';
					// const itemDamageType = workflow.damageDetail.damageParts[0].type.toLowerCase();
					// if (itemDamageType) {
					// 	damageType = itemDamageType;
					// }

					await moonbeamRegion.setFlag('world', 'spell.Moonbeam', {
						damageType: damageType,
						damageRoll: damageRoll,
						saveDC: spelldc,
						spellId: item.id,
						sourceTokenId: token.id,
						itemCardId: args[0].itemCardId
					});

					await actor.setFlag(_flagGroup, flagName, {templateId: templateDoc.uuid});
				}
			}
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
