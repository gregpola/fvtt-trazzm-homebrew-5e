const version = "0.1.0";
const optionName = "Hex Warrior";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0] === "on") {
		// find the actor's weapons
		let weapons = tactor.items.filter(i => i.data.type === `weapon` && i.data.data.proficient && !i.data.data.properties.two);
		let weapon_content = ``;
		for (let weapon of weapons) {
			weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
		}

		let content = `
			<div class="form-group">
			  <label>Choose your weapon to imbue: </label>
			  <select name="weapons">
				${weapon_content}
			  </select>
			</div>`;

		new Dialog({
			title: `${optionName}`,
			content,
			buttons:
			{
				Ok:
				{
					label: `Ok`,
					callback: async (html) => {
						let itemId = html.find('[name=weapons]')[0].value;
						let weaponItem = tactor.items.get(itemId);
						let copy_item = duplicate(weaponItem.toObject());
						DAE.setFlag(tactor, `hex-weapon`, {
							id : itemId,
							ability : copy_item.data.ability
						});
						copy_item.data.ability = "cha";
						tactor.updateEmbeddedDocuments("Item", [copy_item]);
						ChatMessage.create({content: tactor.name + "'s " + copy_item.name + " is blessed by your patron"});
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
		let flag = DAE.getFlag(tactor, `hex-weapon`);
		if (flag) {
			let weaponItem = tactor.items.get(flag.id);
			let copy_item = duplicate(weaponItem.toObject());
			copy_item.data.ability = flag.ability;
			await tactor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(tactor, `hex-weapon`);
			ChatMessage.create({content: tactor.name + "'s " + copy_item.name + " returns to normal"});
		}
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
