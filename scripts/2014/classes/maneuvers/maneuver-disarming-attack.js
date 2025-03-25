/*
	When you hit a creature with a weapon attack, you can expend one superiority die to attempt to disarm the target,
	forcing it to drop one item of your choice that it’s holding. You add the superiority die to the attack’s damage roll,
	and the target must make a Strength saving throw. On a failed save, it drops the object you choose. The object lands at its feet.
*/
const version = "12.3.0";
const optionName = "Disarming Attack";
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

			if ( proceed ) {
				// pay the cost
				const newValue = featureItem.system.uses.value - 1;
				await featureItem.update({"system.uses.value": newValue});

				// build needed values
				const abilityBonus = Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod);
				const saveDC = 8 + actor.system.attributes.prof + abilityBonus;

				// check for dropped item
				let possibleItems = targetToken.actor.items.filter(i => i.system.equipped &&
					((i.type === 'weapon' && i.system.type.value !== 'natural' ) ||
						i.system.type.value.toLowerCase() === 'trinket' ||
						i.system.type.value.toLowerCase() === 'wand' ||
						i.system.type.value.toLowerCase() === 'potion' ));

				if (possibleItems) {
					// roll save for target
					const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} DC${saveDC} ${optionName}`;
					let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor});

					if (saveRoll.total < saveDC) {
						// ask which item to drop
						let itemList = await possibleItems.reduce((list, item) => list += `<option value="${item.id}">${item.name}</option>`, ``);

						let droppedItem = await foundry.applications.api.DialogV2.prompt({
							content: `<p>Which item do you want ${targetToken.name} to drop?</p><form><div class="form-group"><select id="dropItem">${itemList}</select></div></form>`,
							rejectClose: false,
							ok: {
								callback: (event, button, dialog) => {
									const itemId = button.form.elements.dropItem.value;
									if (itemId) {
										return targetToken.actor.items.find(i => i.id === itemId);
									}
									return undefined;
								}
							},
							window: {
								title: `${optionName}`,
							},
							position: {
								width: 400
							}
						});

						if (droppedItem) {
							await game.itempiles.API.createItemPile({
								position: {
									x: targetToken.x + canvas.grid.size,
									y: targetToken.y
								},
								tokenOverrides: {
									img: droppedItem.img,
									width: 0.5,
									height: 0.5,
									name: droppedItem.name
								},
								items: [
									{
										item: droppedItem,
										quantity: 1
									}
								]
							});

							await game.itempiles.API.removeItems(targetToken.actor, [{ item: droppedItem, quantity: 1 }]);
							ChatMessage.create({
								content: `${targetToken.name} drops ${droppedItem.name} on the ground`,
								speaker: ChatMessage.getSpeaker({actor: targetToken.actor})
							});
						}
					}
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
