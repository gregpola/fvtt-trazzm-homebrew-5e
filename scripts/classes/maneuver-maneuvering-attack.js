/*
	When you hit a creature with a weapon attack, you can expend one superiority die to maneuver one of your comrades
	into a more advantageous position. You add the superiority die to the attack’s damage roll, and you choose a friendly
	creature who can see or hear you. That creature can use its reaction to move up to half its speed without provoking
	opportunity attacks from the target of your attack.
 */
const version = "11.0";
const optionName = "Maneuvering Attack";
const featureName = "Superiority Dice";
const cost = 1;

try {
	if (args[0].macroPass === "DamageBonus") {
		let targetToken = workflow.hitTargets.first();

		if (targetToken) {
			// make sure the actor has a superiority die remaining
			let usesLeft = 0;
			let featureItem = actor.items.find(i => i.name === featureName);
			if (featureItem) {
				usesLeft = featureItem.system.uses?.value ?? 0;
				if (!usesLeft || usesLeft < cost) {
					console.info(`${optionName} - not enough ${featureName} uses left`);
				}
			}

			if (usesLeft) {
				// make sure it's an allowed attack
				if (["mwak", "rwak"].includes(workflow.item.system.actionType)) {
					// ask if they want to use Maneuvering Attack
					let dialog = new Promise((resolve, reject) => {
						new Dialog({
							// localize this text
							title: `Combat Maneuver: ${optionName}`,
							content: `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`,
							buttons: {
								one: {
									icon: '<p> </p><img src = "icons/skills/movement/arrows-up-trio-red.webp" width="50" height="50"></>',
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

					let useGA = await dialog;
					if (useGA) {
						// pay the cost
						const newValue = featureItem.system.uses.value - cost;
						await featureItem.update({"system.uses.value": newValue});

						// add damage bonus
						const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
						const diceMult = workflow.isCritical ? 2: 1;
						let damageType = workflow.item.system.damage.parts[0][1];
						return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
					}

				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
