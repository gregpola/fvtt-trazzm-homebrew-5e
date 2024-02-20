/*
	When you hit a creature with a melee weapon attack, you can expend one superiority die to attempt to damage another
	creature with the same attack. Choose another creature within 5 feet of the original target and within your reach.
	If the original attack roll would hit the second creature, it takes damage equal to the number you roll on your
	superiority die. The damage is of the same type dealt by the original attack.
 */
const version = "11.0";
const optionName = "Sweeping Attack";
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
				if (["mwak"].includes(workflow.item.system.actionType)) {
					// find nearby foes
					const potentialTargets = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.FRIENDLY, CONST.TOKEN_DISPOSITIONS.NEUTRAL], targetToken, 5, {canSee: true});
					if (!potentialTargets) {
						console.log(`${optionName} - no targets near your original target`);
						return {};
					}

					// ask which one to attack, will fail if they are too far away
					let target_content = ``;
					for (let t of potentialTargets) {
						target_content += `<option value=${t.id}>${t.name}</option>`;
					}

					let content = `<div class="form-group">
						<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>
						<p><label>Available Targets : </label></p>
						<p><select name="targets">${target_content}</select></p>
					</div>`;

					new Dialog({
						title: `Combat Maneuver: ${optionName}`,
						content,
						buttons:
							{
								Ok:
									{
										icon: '<p><img src = "icons/skills/melee/strike-slashes-red.webp" width="50" height="50"></></p>',
										label: `Yes`,
										callback: async (html) => {
											let itemId = html.find('[name=targets]')[0].value;
											let newTarget = canvas.tokens.get(itemId);

											// check if the attack roll hits the new target
											let hitSuccess = workflow.attackTotal >= newTarget.actor.system.attributes.ac.value;

											// apply damage to the new target
											if (hitSuccess) {
												const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
												let damageType = workflow.item.system.damage.parts[0][1];
												const damageRoll = await new Roll(`${fullSupDie.die}[${damageType}]`).evaluate({ async: false });
												if (game.dice3d) game.dice3d.showForRoll(damageRoll);

												const workflowItemData = duplicate(workflow.item);
												workflowItemData.system.target = { value: 1, units: "", type: "creature" };
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

											// pay the cost
											const newValue = featureItem.system.uses.value - cost;
											await featureItem.update({"system.uses.value": newValue});
										}
									},
								Cancel:
									{
										icon: '<p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></></p>',
										label: "<p>No</p>",
									}
							}
					}).render(true);
				}
			}
		}

		return {};
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
