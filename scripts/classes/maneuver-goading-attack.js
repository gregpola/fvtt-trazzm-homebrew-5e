/*
	When you hit a creature with a weapon attack, you can expend one superiority die to attempt to goad the target into
	attacking you. You add the superiority die to the attack’s damage roll, and the target must make a Wisdom saving throw.
	On a failed save, the target has disadvantage on all attack rolls against targets other than you until the end of your next turn.
*/
const version = "11.0";
const optionName = "Goading Attack";
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
					// ask if they want to use Goading Attack
					let dialog = new Promise((resolve, reject) => {
						new Dialog({
							// localize this text
							title: `Combat Maneuver: ${optionName}`,
							content: `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`,
							buttons: {
								one: {
									icon: '<p> </p><img src = "icons/magic/control/silhouette-grow-shrink-blue.webp" width="50" height="50"></>',
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

						// build needed values
						const abilityBonus = Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod);
						const saveDC = 8 + actor.system.attributes.prof + abilityBonus;
						const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];

						// request the target saving throw
						const sourceTokenId = workflow.token.id;
						await game.MonksTokenBar.requestRoll([{token: targetToken}], {
							request: [{"type": "save", "key": "wis"}],
							dc: saveDC, showdc: true,
							silent: true, fastForward: false,
							flavor: `${optionName}`,
							rollMode: 'roll',
							callback: async (result) => {
								for (let tr of result.tokenresults) {
									if (!tr.passed) {
										await markAsGoaded(targetToken.actor.uuid, actor.uuid, sourceTokenId);
										ChatMessage.create({'content': `Combat Maneuver: ${optionName} - ${targetToken.name} is goaded by ${actor.name}`});
									}
								}
							}
						});

						// add damage bonus
						const diceMult = workflow.isCritical ? 2: 1;
						let damageType = workflow.item.system.damage.parts[0][1];
						return {damageRoll: `${diceMult}${fullSupDie.die}[${damageType}]`, flavor: optionName};
					}
				}
			}
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

async function markAsGoaded(targetId, actorId, sourceTokenId) {
	const effectData = {
		name: `${optionName} - Goaded`,
		icon: "icons/magic/control/silhouette-grow-shrink-blue.webp",
		origin: actorId,
		changes: [
			{
				key: 'flags.midi-qol.disadvantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 'workflow.targets?.first()?.id != "' + sourceTokenId + '"',
				priority: 20
			}
		],
		flags: {
			dae: {
				specialDuration: [
					"turnEndSource"
				]
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
