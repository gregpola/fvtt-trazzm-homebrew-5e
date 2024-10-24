const version = "11.1";
const optionName = "Quick Toss";
const featureName = "Superiority Dice";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for available uses
		let featureItem = actor.items.find(i => i.name === featureName);
		if (featureItem) {
			let usesLeft = featureItem.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${featureName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${featureName} uses left`);
				return false;
			}
		}
		else {
			console.error(`${optionName} - no ${featureName} item on actor`);
			ui.notifications.error(`${optionName} - no ${featureName} item on actor`);
			return false;
		}

		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
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
				// find the actor's weapons
				let weapons = actor.items.filter(i => i.type === `weapon` && i.system.actionType === "mwak" && i.system.properties.has('thr'));
				let weapon_content = ``;
				for (let weapon of weapons) {
					weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
				}

				if (weapon_content.length === 0) {
					return ui.notifications.error(`${optionName} - no thrown weapons found`);
				}

				let content = `
					<div class="form-group">
					  <p><label>Choose the weapon to throw : </label></p>
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
										const options = {
											showFullCard: false,
											configureDialog: false
										};
										await MidiQOL.completeItemUse(weaponItem, {}, options);

										const newValue = featureItem.system.uses.value - cost;
										await featureItem.update({"system.uses.value": newValue});
									}
								},
							Cancel:
								{
									label: `Cancel`
								}
						}
				}).render(true);
			}
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
