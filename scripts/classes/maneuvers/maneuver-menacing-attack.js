/*
	When you hit a creature with a weapon attack, you can expend one superiority die to attempt to frighten the target.
	You add the superiority die to the attack’s damage roll, and the target must make a Wisdom saving throw. On a failed
	save, it is Frightened of you until the end of your next turn.
 */
const version = "12.3.0";
const optionName = "Menacing Attack";
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
					await HomebrewEffects.applyFrightenedEffect(targetToken.actor, macroItem.uuid, ["turnEndSource"]);
				}

				// apply damage bonus
				const diceMult = workflow.isCritical ? 2: 1;
				const damageType = workflow.item.system.damage.parts[0][1];
				const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
				return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
			}
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}
