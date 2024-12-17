/*
	When you hit a creature with a weapon attack, you can expend one superiority die to attempt to drive the target back.
	You add the superiority die to the attack’s damage roll, and if the target is Large or smaller, it must make a
	Strength saving throw. On a failed save, you push the target up to 15 feet away from you.
 */
const version = "12.3.0";
const optionName = "Pushing Attack";
const featureName = "Superiority Dice";

try {
	let targetToken = workflow.hitTargets.first();
	if (args[0].macroPass === "DamageBonus" && targetToken) {
		// make sure the actor has superiority die remaining
		let usesLeft = 0;
		let featureItem = actor.items.find(i => i.name === featureName);
		if (featureItem) {
			usesLeft = featureItem.system.uses?.value ?? 0;
			if (!usesLeft) {
				console.info(`${optionName} - not enough ${featureName} uses left`);
				return {};
			}
		}

		if (["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			const proceed = await foundry.applications.api.DialogV2.confirm({
				content: `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`,
				rejectClose: false,
				modal: true
			});

			if (proceed) {
				// pay the cost
				const newValue = featureItem.system.uses.value - 1;
				await featureItem.update({"system.uses.value": newValue});

				// build needed values
				const abilityBonus = Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod);
				const saveDC = 8 + actor.system.attributes.prof + abilityBonus;

				// roll save for target
				const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;
				let saveRoll = await targetToken.actor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "frightened"});

				if (saveRoll.total < saveDC) {
					// ask how many squares
					const content = `<p>How far do you want to push ${targetToken.name}?</p>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="1" checked>   5 feet  </label>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="2">   10 feet </label>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="3">   15 feet </label>`;

					let squaresPushed = await foundry.applications.api.DialogV2.prompt({
						content: content,
						rejectClose: false,
						ok: {
							callback: (event, button, dialog) => {
								return button.form.elements.choice.value;
							}
						},
						window: {
							title: `${optionName}`,
						},
						position: {
							width: 400
						}
					});
					await HomebrewMacros.pushTarget(token, targetToken, Number(squaresPushed));
				}

				// apply damage bonus
				const diceMult = workflow.isCritical ? 2: 1;
				const damageType = workflow.item.system.damage.parts[0][1];
				const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
				return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
			}
		}

		return {};
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
