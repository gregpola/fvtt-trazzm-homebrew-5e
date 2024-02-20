/*
	When you make a melee weapon attack on your turn, you can expend one superiority die to increase your reach for that
	attack by 5 feet. If you hit, you add the superiority die to the attack’s damage roll.
 */
const version = "11.0";
const optionName = "Lunging Attack";
const featureName = "Superiority Dice";
const cost = 1;
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "lunging-attack-weapon";

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for available uses
		let featureItem = actor.items.find(i => i.name === featureName);
		if (featureItem) {
			let usesLeft = featureItem.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${featureName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${featureName} uses left`);
			}
			else {
				const newValue = featureItem.system.uses.value - cost;
				await featureItem.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${featureName} item on actor`);
			ui.notifications.error(`${optionName} - no ${featureName} item on actor`);
		}

		ui.notifications.error(`${featureName} - feature not found`);
		return false;
	}
	else if (args[0] === "on") {
		// find the actor's weapons
		let weapons = actor.items.filter(i => i.type === `weapon` && i.system.actionType === "mwak");
		let weapon_content = ``;
		for (let weapon of weapons) {
			weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
		}

		if (weapon_content.length === 0) {
			return ui.notifications.error(`${optionName} - no melee weapons found`);
		}

		let content = `
			<div class="form-group">
			  <p><label>Weapons : </label></p>
			  <p><select name="weapons">
				${weapon_content}
			  </select></p>
			</div>`;

		new Dialog({
			title: "Choose your weapon",
			content,
			buttons:
				{
					Ok:
						{
							label: `Ok`,
							callback: async (html) => {
								let itemId = html.find('[name=weapons]')[0].value;
								let weaponItem = actor.items.get(itemId);
								const itemName = weaponItem.name;


								let mutations = {};
								const newName = itemName + ` (${optionName})`;
								const oldReach = weaponItem.system.range.value;

								mutations[weaponItem.name] = {
									"name": newName,
									"system.range.value": oldReach + 5
								};

								const updates = {
									embedded: {
										Item: mutations
									}
								};

								// mutate the selected item
								await warpgate.mutate(token.document, updates, {}, { name: itemName });

								// track the effect
								await actor.setFlag(_flagGroup, flagName, {
									weaponId : itemId,
									weaponName: itemName
								});

								// get the mutated weapon and make the attack
								let theItem = actor.items.get(itemId);
								const options = {
									showFullCard: false,
									configureDialog: false
								};
								await MidiQOL.completeItemUse(theItem, {}, options);
							}
						},
					Cancel:
						{
							label: `Cancel`
						}
				}
		}).render(true);
	}
	else if (args[0] === "off") {
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, flagName);
			await warpgate.revert(token.document, flag.weaponName);
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
