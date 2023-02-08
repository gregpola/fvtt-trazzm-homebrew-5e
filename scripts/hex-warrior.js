/*
	At 1st level, you acquire the training necessary to effectively arm yourself for battle. You gain proficiency with medium armor, shields, and martial weapons.

	The influence of your patron also allows you to mystically channel your will through a particular weapon. Whenever you finish a long rest, you can touch one weapon that you are proficient with and that lacks the two-handed property. When you attack with that weapon, you can use your Charisma modifier, instead of Strength or Dexterity, for the attack and damage rolls. This benefit lasts until you finish a long rest. If you later gain the Pact of the Blade feature, this benefit extends to every pact weapon you conjure with that feature, no matter the weapon’s type.
*/
const version = "10.0.0";
const optionName = "Hex Warrior";
const hexFlag = "hex-weapon";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		// find the actor's weapons
		let weapons = actor.items.filter(i => i.type === `weapon` && i.system.proficient && !i.system.properties.two);
		if (weapons.length === 0 ) {
			ui.notifications.error(`${optionName} - no applicable weapons found`);
			return;
		}
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
						let selectedItem = actor.items.get(itemId);
						const itemName = selectedItem.name;
						
						let mutations = {};
						const newName = itemName + ` (${optionName})`;
						
						mutations[selectedItem.name] = {
							"name": newName,
							"system.ability": "cha"
						};
												
						const updates = {
							embedded: {
								Item: mutations
							}
						};
						
						// mutate the selected item
						await warpgate.mutate(actorToken.document, updates, {}, { name: itemName });
												
						// track target info on the source actor
						DAE.setFlag(actor, hexFlag, {
							ttoken: actorToken.id,
							itemName : itemName
						});

						ChatMessage.create({
							content: `${actorToken.name}'s ${selectedItem.name} is imbued with your patron's power`,
							speaker: ChatMessage.getSpeaker({ actor: actor })});
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
		let flag = DAE.getFlag(actor, hexFlag);
		if (flag) {
			const itemName = flag.itemName;
			let restore = await warpgate.revert(actorToken.document, itemName);
			DAE.unsetFlag(actor, hexFlag);
			ChatMessage.create({
				content: `${actorToken.name}'s ${itemName} returns to normal.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
