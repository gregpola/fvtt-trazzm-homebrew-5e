/*
	When you hit a creature with a weapon attack, you can expend one superiority die to distract the creature, giving your
	allies an opening. You add the superiority die to the attack’s damage roll. The next attack roll against the target
	by an attacker other than you has advantage if the attack is made before the start of your next turn.
*/
const version = "12.3.0";
const optionName = "Distracting Strike";
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

		if (usesLeft) {

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

					// apply advantage
					await markGrantsAdvantage(targetToken.actor.uuid);
					ChatMessage.create({
						content: `${optionName} - ${targetToken.name} is distracted by ${actor.name}`,
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
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function markGrantsAdvantage(targetId) {
	const effectData = {
		name: `${optionName} - Distracted`,
		icon: "icons/magic/control/hypnosis-mesmerism-eye-tan.webp",
		origin: macroItem.uuid,
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
				value: 'function.HomebrewMacros.handleDistractingStrike, isAttacked',
				priority: 21
			}
		],
		duration: {
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
