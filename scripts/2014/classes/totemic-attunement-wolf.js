const version = "12.3.0";
const optionName = "Totemic Attunement - Wolf";

try {
	if (args[0].macroPass === "DamageBonus") {
		const targetToken = workflow.targets.first();

		// make sure it's an allowed attack
		if (!["mwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}
		
		// make sure the actor is raging
		let rageEffect = HomebrewHelpers.findEffect(actor, "Rage");
		if (!rageEffect) {
			console.log(`${optionName}: actor must be raging`);
			return {};
		}
		
		// make sure the target is large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			console.log(`${optionName}: target is too large to trip`);
			return {};
		}

		// ask if they want to use the option
		let useFeature = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Use a bonus action to knock ${targetToken.name} prone?</p>`,
			rejectClose: false,
			modal: true
		});

		if (useFeature) {
			const hasEffectApplied = HomebrewHelpers.findEffect(targetToken.actor, 'Prone');
			if (!hasEffectApplied) {
				await HomebrewEffects.applyProneEffect(targetToken.actor, item);
			}
		}
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
