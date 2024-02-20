/*
	When you hit a creature with a weapon attack, you can expend one superiority die to distract the creature, giving your
	allies an opening. You add the superiority die to the attack’s damage roll. The next attack roll against the target
	by an attacker other than you has advantage if the attack is made before the start of your next turn.
*/
const version = "11.0";
const optionName = "Distracting Strike";
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
					// ask if they want to use the option
					let dialog = new Promise((resolve, reject) => {
						new Dialog({
							// localize this text
							title: `Combat Maneuver: ${optionName}`,
							content: `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`,
							buttons: {
								one: {
									icon: '<p> </p><img src = "icons/magic/control/hypnosis-mesmerism-eye-tan.webp" width="50" height="50"></>',
									label: "<p>Yes</p>",
									callback: () => resolve(true)
								},
								two: {
									icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
									label: "<p>No</p>",
									callback: () => {
										resolve(false)
									}
								}
							},
							default: "two"
						}).render(true);
					});

					let useManeuver = await dialog;
					if (useManeuver) {
						// pay the cost
						const newValue = featureItem.system.uses.value - cost;
						await featureItem.update({"system.uses.value": newValue});

						// apply the damage bonus
						const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
						ChatMessage.create({'content': `Combat Maneuver: ${optionName} - ${targetToken.name} is distracted by ${actor.name}`});

						// apply advantage - doesn't work because the effect ends with this workflow
						await markGrantsAdvantage(targetToken.actor.uuid, actor.uuid);

						// add damage bonus
						const diceMult = workflow.isCritical ? 2 : 1;
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

async function markGrantsAdvantage(targetId, actorId) {
	const effectData = {
		name: `${optionName} - Distracted`,
		icon: "icons/magic/control/hypnosis-mesmerism-eye-tan.webp",
		origin: actorId,
		changes: [
			{
				key: 'flags.midi-qol.grants.advantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 'workflow.token.id != "' + workflow.token.id + '"',
				priority: 20
			},
			{
				key: 'flags.midi-qol.onUseMacroName',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 'function.HomebrewMacros.handleDistractingStrike,isAttacked',
				priority: 21
			}
		],
		duration: {
			rounds: 1
		},
		flags: {
			dae: {
				specialDuration: [
					"turnStartSource"
				]
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
