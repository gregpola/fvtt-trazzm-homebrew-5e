/*
	Two luminous, spectral wings sprout from your back temporarily. Until the transformation ends, you have a Fly speed
	equal to your walking speed, and once on each of your turns, you can deal extra radiant damage to one target when
	you deal damage to it with an attack or a spell. The extra damage equals your proficiency bonus.
 */
const version = "12.3.0";
const optionName = "Radiant Soul";
const timeFlag = "radiantSoulTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return {};
		}

		let useFeature = false;
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} damage to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/holy/saint-glass-portrait-halo.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});

		useFeature = await dialog;
		if (!useFeature) {
			console.log(`${optionName}: player chose to skip`);
			return {};
		}

		await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
		const pb = actor.system.attributes.prof ?? 2;
		return {damageRoll: `${pb}[radiant]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
