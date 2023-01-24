const version = "10.0.0";
const optionName = "Blessing of the Forge";
const flagName = "blessing-of-the-forge";
const gameVersion = Math.floor(game.version);

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const target = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "preItemRoll") {
		// first check if there are any uses remaining
		let uses = lastArg.item?.system?.uses?.value ?? 0;
		if (uses < 1) {
			ui.notifications.error(`${optionName} - no uses remaining`);
			return false;
		}
		
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
		// get target token
		let ttoken = allies.find(i => i.document.actorId === tactor._id);
		if (!ttoken) {
			ttoken = target;
		}		

		// find the target actor's weapons & armor that are not magical
		let weapons;
		let armor;
		
		if (gameVersion > 9) {
			weapons = tactor.items.filter(i => ((i.type === `weapon`) && !i.system.properties?.mgc));
			armor = tactor.items.filter(i => ((i.type === `equipment`) && i.system.armor?.type && !i.system.properties?.mgc));
		}
		else {
			weapons = tactor.items.filter(i => ((i.data.type === `weapon`) && !i.data.data.properties?.mgc));
			armor = tactor.items.filter(i => ((i.data.type === `equipment`) && i.data.data.armor?.type && !i.data.data.properties?.mgc));
		}

		let targetItems = weapons.concat(armor);
		if (targetItems.length < 1) {
			ui.notifications.error(`${optionName} - ${tactor.name} has no eligible items`);
			return false;
		}
		
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
			title: `⚔️ Choose the item to bless`,
			content,
			buttons:
			{
				Ok:
				{
					label: `Ok`,
					callback: async (html) => {
						let itemId = html.find('[name=titem]')[0].value;
						let selectedItem = tactor.items.get(itemId);
						const itemName = selectedItem.name;
						let isWeapon = selectedItem.type === `weapon`;
						var armorClass = isWeapon ? 0 : ((gameVersion > 9) ? Number(selectedItem.system.armor.value || 0) : Number(selectedItem.data.data.armor.value || 0));
						var attackBonus = isWeapon ? ((gameVersion > 9) ? Number(selectedItem.system.attackBonus || 0) : Number(selectedItem.data.data.attackBonus || 0)) : 0;
						var damageParts = isWeapon ? ((gameVersion > 9) ? selectedItem.system.damage.parts : selectedItem.data.data.damage.parts) : null;

						// apply the blessing
						let mutations = {};
						const newName = itemName + ` (${optionName})`;

						if (isWeapon) {
							damageParts[0][0] = damageParts[0][0] + " + 1";
							
							if (gameVersion > 9) {
								mutations[selectedItem.name] = {
									"name": newName,
									"system.properties.mgc": true,
									"system.attackBonus": attackBonus + 1,
									"system.damage.parts": damageParts
								};
							}
							else {
								mutations[selectedItem.name] = {
									"name": newName,
									"data.properties.mgc": true,
									"data.attackBonus": attackBonus + 1,
									"data.damage.parts": damageParts
								};
							}
						}
						else {
							if (gameVersion > 9) {
								mutations[selectedItem.name] = {
									"name": newName,
									"system.properties.mgc": true,
									"system.armor.value": armorClass + 1
								};
							}
							else {
								mutations[selectedItem.name] = {
									"name": newName,
									"data.properties.mgc": true,
									"data.armor.value": armorClass + 1
								};
							}
						}
						
						const updates = {
							embedded: {
								Item: mutations
							}
						};
						
						// mutate the selected item
						await warpgate.mutate(ttoken.document, updates, {}, { name: itemName });
						
						// track target info on the source actor
						DAE.setFlag(actor, `blessing-of-the-forge`, {
							ttoken: ttoken.id,
							itemName : itemName
						});

						ChatMessage.create({content: tactor.name + "'s " + itemName + " received the Blessing of the Forge from <b>" + actor.name + "</b>"});
						return true;
					}
				},
				Cancel:
				{
					label: `Cancel`,
					callback: async (html) => {
						return false;
					}
				}
			}
		}).render(true);
	}
	else if (args[0] === "off") {
		// TODO need to store the target token data for use here
		let flag = DAE.getFlag(actor, `blessing-of-the-forge`);
		if (flag) {
			const ttoken = canvas.tokens.get(flag.ttoken);
			const itemName = flag.itemName;
			let restore = await warpgate.revert(ttoken.document, itemName);
			console.log(`${optionName} - restore is: ${restore}`);
			
			DAE.unsetFlag(actor, `blessing-of-the-forge`);
			ChatMessage.create({
				content: `${ttoken.name}'s ${itemName} returns to normal.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
