const version = "0.1.0";
const optionName = "Blessing of the Forge";
const flagName = "blessing-of-the-forge";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const target = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
		let tactor = actor;
		let targetChoices = new Set();
		targetChoices.add({ type: "radio", label: actor.name, value: actor.uuid, options: "blessingTarget" });

		// ask the caster who to bless an item on
		const allies = MidiQOL.findNearby(1, target, 60, 0);
		for (var i = 0; i < allies.length; i++) {
			targetChoices.add({ type: "radio", label: allies[i].name, value: allies[i].actor.uuid, options: "blessingTarget" });
		}

		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "Apply Blessing", value: true },
			{ label: "Cancel", value: false }
		];
		menuOptions["inputs"] = Array.from(targetChoices);
		let choices = await warpgate.menu(menuOptions, { title: `${optionName}: Who shall be blessed?`, options: { height: "100%" } });
		let targetButtons = choices.buttons;
		
		if (!targetButtons) {
			console.log("No target selected");
			return false;
		}

		let blessingChoices = choices.inputs.filter(Boolean);
		let targetId = blessingChoices[0];
		tactor = MidiQOL.MQfromActorUuid(targetId);

		// find the target actor's weapons & armor that are not magical
		let weapons = tactor.items.filter(i => ((i.data.type === `weapon`) && !i.data.data.properties?.mgc));
		let armor = tactor.items.filter(i => ((i.data.type === `equipment`) && i.data.data.armor?.type && !i.data.data.properties?.mgc));
		let targetItems = weapons.concat(armor);		
		let target_content = ``;
		for (let ti of targetItems) {
			target_content += `<option value=${ti.id}>${ti.name}</option>`;
		}

		let content = `
			<div class="form-group">
			  <label>Weapons and Armor:</label>
			  <div style="margin: 10px;">
				  <select name="titem">
					${target_content}
				  </select>
			  </div>
			</div>`;

		new Dialog({
			title: "Choose the equipment to bless",
			content,
			buttons:
			{
				Ok:
				{
					label: `Ok`,
					callback: async (html) => {
						let itemId = html.find('[name=titem]')[0].value;
						let selectedItem = tactor.items.get(itemId);
						let copy_item = duplicate(selectedItem.toObject());
						let isWeapon = copy_item.type === `weapon`;
						const copyItemName = copy_item.name;
						var armorClass = Number(copy_item.data?.armor?.value);
						var attackBonus = Number(copy_item.data.attackBonus);
						var damageParts = isWeapon ? copy_item.data.damage.parts[0][0] : null;
						
						DAE.setFlag(actor, flagName, {
							id : itemId,
							actorId : tactor.uuid,
							itemName: copyItemName,
							ac: armorClass,
							attack: attackBonus,
							damage : damageParts,
							props : copy_item.data.properties
						});
						
						// apply the blessing
						if (isWeapon) {
							var newdamage = damageParts + " + 1";
							copy_item.data.damage.parts[0][0] = newdamage;
							copy_item.data.attackBonus = attackBonus + 1;
							copy_item.data.properties.mgc = true;
						}
						else {
							var newAC = armorClass + 1;
							copy_item.data.armor.value = newAC;
							if (copy_item.data.properties) {
								copy_item.data.properties.mgc = true;
							}
							else {
								copy_item.data.properties = {
									mgc: true
								};
							}
						}
						
						copy_item.name = "Blessed " + copyItemName;
						tactor.updateEmbeddedDocuments("Item", [copy_item]);
						ChatMessage.create({content: copyItemName + " received the Blessing of the Forge from " + actor.name});
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
		let flag = DAE.getFlag(actor, flagName);
		if (flag) {
			let tactor = MidiQOL.MQfromActorUuid(flag.actorId);
			if (!tactor) {
				tactor = actor;
			}
			
			let blessedItem = tactor.items.get(flag.id);
			let copy_item = duplicate(blessedItem.toObject());

			if (copy_item.type === `weapon`) {
				copy_item.data.damage.parts[0][0] = flag.damage;
				copy_item.data.attackBonus = flag.attack;
				copy_item.data.properties.mgc = false;
			}
			else {
				copy_item.data.armor.value = flag.ac;
				//copy_item.data.properties = flag.props;
				copy_item.data.properties.mgc = false;
			}
			
			copy_item.name = flag.itemName;
			await tactor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(actor, flagName);
			ChatMessage.create({content: copy_item.name + " returns to normal"});
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
