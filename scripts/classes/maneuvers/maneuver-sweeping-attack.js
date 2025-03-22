/*
	When you hit a creature with a melee weapon attack, you can expend one superiority die to attempt to damage another
	creature with the same attack. Choose another creature within 5 feet of the original target and within your reach.
	If the original attack roll would hit the second creature, it takes damage equal to the number you roll on your
	superiority die. The damage is of the same type dealt by the original attack.
 */
const version = "12.3.1";
const optionName = "Sweeping Attack";
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

		// make sure it's an allowed attack
		if (["mwak"].includes(workflow.item.system.actionType)) {
			// find nearby foes
			const nearTarget = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.FRIENDLY, CONST.TOKEN_DISPOSITIONS.NEUTRAL], targetToken, 5, {canSee: true});
			if (!nearTarget) {
				console.log(`${optionName} - no targets near your original target`);
				return {};
			}

			// eliminate targets not close enough for the current attack
			const maxRange = Number(item.system.range.value);
			let nearActor = MidiQOL.findNearby(null, token, maxRange, {canSee: true});
			if (!nearActor) {
				console.log(`${optionName} - no targets close enough to hit`);
				return {};
			}

			const potentialTargets = nearActor.filter(value => nearTarget.includes(value));
			if (!potentialTargets || potentialTargets.length === 0) {
				console.log(`${optionName} - no eligible targets`);
				return {};
			}

			// ask if they want to use the feature
			const proceed = await foundry.applications.api.DialogV2.confirm({
				content: `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`,
				rejectClose: false,
				modal: true
			});

			if ( proceed ) {
				// pay the cost
				const newValue = featureItem.system.uses.value - 1;
				await featureItem.update({"system.uses.value": newValue});

				// ask which one to attack, will fail if they are too far away
				let target_content = ``;
				for (let t of potentialTargets) {
					target_content += `<option value=${t.id}>${t.name}</option>`;
				}

				let content = `<div class="form-group">
							<p><label>Sweeping Target: </label></p>
							<p><select name="targets">${target_content}</select></p>
						</div>`;

				let targetId = await foundry.applications.api.DialogV2.prompt({
					content: content,
					rejectClose: false,
					ok: {
						callback: (event, button, dialog) => {
							return button.form.elements.targets.value
						}
					},
					window: {
						title: `${optionName}`,
					},
					position: {
						width: 400
					}
				});

				if (targetId) {
					let newTarget = canvas.tokens.get(targetId);
					if (newTarget) {
						// check if the attack roll hits the new target
						let hitSuccess = workflow.attackTotal >= newTarget.actor.system.attributes.ac.value;

						// apply damage to the new target
						if (hitSuccess) {
							const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
							let damageType = workflow.item.system.damage.parts[0][1];
							const damageRoll = await new Roll(`${fullSupDie.die}[${damageType}]`).evaluate();
							const workflowItemData = foundry.utils.duplicate(workflow.item);
							workflowItemData.system.target = {value: 1, units: "", type: "creature"};
							workflowItemData.name = `${optionName} : secondary damage`;

							await new MidiQOL.DamageOnlyWorkflow(
								actor,
								token.data,
								damageRoll.total,
								damageType,
								[newTarget],
								damageRoll,
								{
									flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
									itemCardId: "new",
									itemData: workflowItemData,
									isCritical: workflow.isCritical,
								}
							);
						}
					}
				}
			}
		}

		return {};
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
