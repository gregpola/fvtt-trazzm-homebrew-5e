/*
	When you hit a creature with a weapon attack, you can expend one superiority die to maneuver one of your comrades
	into a more advantageous position. You add the superiority die to the attack’s damage roll, and you choose a friendly
	creature who can see or hear you. That creature can use its reaction to move up to half its speed without provoking
	opportunity attacks from the target of your attack.
 */
const version = "12.3.0";
const optionName = "Maneuvering Attack";
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

				ChatMessage.create({
					content: 'A friendly creature who can see or hear you. That creature can use its reaction to move up to half its speed without provoking opportunity attacks from the target of your attack.',
					speaker: ChatMessage.getSpeaker({actor: actor})
				});

				// apply damage bonus
				const diceMult = workflow.isCritical ? 2: 1;
				const damageType = workflow.item.system.damage.parts[0][1];
				const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
				return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
			}
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
