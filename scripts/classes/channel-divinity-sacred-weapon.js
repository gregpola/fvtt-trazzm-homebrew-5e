/*
	As an action, you can imbue one weapon that you are holding with positive energy, using your Channel Divinity.
	For 1 minute, you add your Charisma modifier to attack rolls made with that weapon (with a minimum bonus of +1).
	The weapon also emits bright light in a 20-foot radius and dim light 20 feet beyond that. If the weapon is not
	already magical, it becomes magical for the duration.

	You can end this effect on your turn as part of any other action. If you are no longer holding or carrying this
	weapon, or if you fall Unconscious, this effect ends.
*/
const version = "11.2";
const optionName = "Sacred Weapon";
const channelDivinityName = "Channel Divinity (Paladin)";
const cost = 1;

try {
	const lastArg = args[args.length - 1];

	if (args[0] === "on") {
		// check Channel Divinity uses available
		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		if (channelDivinity) {
			let usesLeft = channelDivinity.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				return false;
			}
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
			return false;
		}

		// find the actor's weapons
		let weapons = actor.items.filter(i => i.type === `weapon`);
		let weapon_content = ``;
		for (let weapon of weapons) {
			weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
		}

		let content = `
			<div class="form-group">
			  <label>Weapons : </label>
			  <select name="weapons">
				${weapon_content}
			  </select>
			</div>`;

		new Dialog({
			title: "Choose your weapon to imbue",
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
						const attackMod = Math.max(actor.system.abilities["cha"].mod, 1);
						const oldBonus = Number(selectedItem.system.attackBonus);
						const newBonus = attackMod + oldBonus;

						mutations[selectedItem.name] = {
							"name": newName,
							"system.attackBonus": newBonus,
							"system.properties.mgc": true
						};
												
						const updates = {
							embedded: {
								Item: mutations
							}
						};
						
						// mutate the selected item
						await warpgate.mutate(token.document, updates, {}, { name: itemName });
	
						// track target info on the source actor
						DAE.setFlag(actor, `sacred-weapon`, {
							ttoken: token.id,
							itemName : itemName
						});
						
						// create the light effect
						addLightEffects(actor, lastArg.origin);

						const newValue = channelDivinity.system.uses.value - cost;
						await channelDivinity.update({"system.uses.value": newValue});

						ChatMessage.create({
							content: `${token.name}'s ${selectedItem.name} is blessed with positive energy`,
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
		let flag = DAE.getFlag(actor, `sacred-weapon`);
		if (flag) {
			const itemName = flag.itemName;
			let restore = await warpgate.revert(token.document, itemName);
			DAE.unsetFlag(actor, `sacred-weapon`);
			ChatMessage.create({
				content: `${token.name}'s ${itemName} returns to normal.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}

// Add the light effect to the actor
async function addLightEffects(target, origin) {
    const effectData = {
        name: "sacred-weapon-light",
        icon: "icons/magic/light/beam-rays-yellow-blue-large.webp",
        origin: origin,
        changes: [
			{
				key: 'ATL.light.dim',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "40",
				priority: 21
			},
			{
				key: 'ATL.light.bright',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "20",
				priority: 22
			},
			{
				key: 'ATL.light.alpha',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "0.3",
				priority: 23
			}
			
		],
        disabled: false
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: [effectData] });
}
