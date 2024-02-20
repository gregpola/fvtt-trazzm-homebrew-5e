const version = "11.0";
const optionName = "Menacing Attack";
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
					// ask if they want to use Menacing Attack
					let dialog = new Promise((resolve, reject) => {
						new Dialog({
							// localize this text
							title: `Combat Maneuver: ${optionName}`,
							content: `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`,
							buttons: {
								one: {
									icon: '<p> </p><img src = "icons/magic/control/fear-fright-monster-green.webp" width="50" height="50"></>',
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
						const effectOrigin = actor.uuid;
						const targetActorId = targetToken.actor.uuid;

						await game.MonksTokenBar.requestRoll([{token: targetToken}], {
							request: [{"type": "save", "key": "wis"}],
							dc: saveDC, showdc: true,
							silent: true, fastForward: false,
							flavor: `${optionName}`,
							rollMode: 'roll',
							callback: async (result) => {
								for (let tr of result.tokenresults) {
									if (!tr.passed) {
										await markAsFrightened(effectOrigin, targetActorId);
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

async function markAsFrightened(origin, targetId) {

	const effectData = {
		name: `${optionName} - Frightened`,
		icon: "icons/magic/control/fear-fright-monster-green.webp",
		origin: origin,
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Frightened",
				priority: 20
			}
		],
		flags: {
			dae: {
				specialDuration: [
					"turnEndSource"
				]
			}
		}
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
