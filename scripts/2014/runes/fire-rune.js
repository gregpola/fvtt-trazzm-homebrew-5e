/*
	In addition, when you hit a creature with an attack using a weapon, you can invoke the rune to summon fiery shackles:
	the target takes an extra 2d6 fire damage, and it must succeed on a Strength saving throw or be Restrained for 1
	minute. While restrained by the shackles, the target takes 2d6 fire damage at the start of each of its turns. The
	target can repeat the saving throw at the end of each of its turns, banishing the shackles on a success. Once you
	invoke this rune, you can’t do so again until you finish a short or long rest.
*/
const version = "12.3.0";
const optionName = "Fire Rune";
const invokeItemName = 'Invoke Fire Rune';

try {
	if (args[0].macroPass === "DamageBonus") {
		const targetToken = workflow.hitTargets.first();
		if (!targetToken) {
			return {};
		}

		// Skip if the action isn't an weapon attack roll
		if (!["mwak", "rwak"].includes(item.system.actionType)) {
			console.log(`${optionName} - action type isn't applicable`);
			return {};
		}
		
		// make sure the feature has uses available
		let featureItem = actor.items.getName(invokeItemName);
		if (!featureItem) {
			return {};
		}
		
		const usesLeft = featureItem.system.uses?.value ?? 0;
		if (!usesLeft) {
			console.log(`${invokeItemName} - out of uses`);
			return {};
		}
		
		// ask if they want to use the feature
		const useFeature = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Use your ${optionName} to apply burning effect? (${usesLeft} uses left)</p>`,
			rejectClose: false,
			modal: true
		});

		if (useFeature) {
			// reduce feature uses
			//await featureItem.update({ "system.uses.value": usesLeft - 1 });

			// invoke the item
			const [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
			await MidiQOL.completeItemUse(featureItem, config, options);

			// return initial damage bonus
			const diceCount = workflow.isCritical ? 4: 2;
			return {damageRoll: `${diceCount}d6[fire]`, flavor: optionName};
		}		
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
