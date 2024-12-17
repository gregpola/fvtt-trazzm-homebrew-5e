const version = "12.3.0";
const optionName = "Quick Toss";

try {
	let targetToken = workflow.hitTargets.first();
	if (args[0].macroPass === "postActiveEffects" && targetToken) {
		// find the actor's weapons
		let weapons = actor.items.filter(i => i.type === `weapon` && i.system.properties.has('thr'));
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

		// ask which weapon to throw
		let weaponId = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.weapons.value
				}
			},
			window: {
				title: `${optionName}`,
			},
			position: {
				width: 400
			}
		});

		if (weaponId) {
			let weaponItem = actor.items.get(weaponId);
			const options = {
				showFullCard: false,
				configureDialog: false
			};
			await MidiQOL.completeItemUse(weaponItem, {}, options);
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
