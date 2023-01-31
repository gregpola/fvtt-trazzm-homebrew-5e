/*
	The wood of a club or quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. The weapon also becomes magical, if it isn't already. The spell ends if you cast it again or if you let go of the weapon.
*/
const version = "10.0.0";
const optionName = "Shillelagh";
const lastArg = args[args.length - 1];
let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
let actorToken = canvas.tokens.get(lastArg.tokenId);

try {
	if (args[0] === "on") {
		
		// build list of weapons that can be enchanted
		// TODO filter out non appropriate weapons
		let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.baseItem === "quarterstaff" || i.system.baseItem === "club"));
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
			title: "Choose a club or quarterstaff",
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

						var damageParts = selectedItem.system.damage.parts;
						let damage = damageParts[0][0];
						var newdamage = damage.replace(/1d(4|6)/g,"1d8");
						
						// decide which ability to use
						var bestAbility = actor.system.abilities["wis"].mod > actor.system.abilities["str"].mod ? "wis" : "str";
						
						mutations[selectedItem.name] = {
							"name": newName,
							"system.ability": bestAbility,
							"system.properties.mgc": true,
							"system.damage.parts": newdamage
						};
												
						const updates = {
							embedded: {
								Item: mutations
							}
						};
						
						// mutate the selected item
						await warpgate.mutate(actorToken.document, updates, {}, { name: itemName });
												
						// track target info on the source actor
						DAE.setFlag(actor, `spell-shillelagh`, {
							ttoken: actorToken.id,
							itemName : itemName
						});

						ChatMessage.create({
							content: `${actorToken.name}'s ${selectedItem.name} is imbued with nature's power`,
							speaker: ChatMessage.getSpeaker({ actor: actor })});
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
		let flag = DAE.getFlag(actor, `spell-shillelagh`);
		if (flag) {
			const itemName = flag.itemName;
			let restore = await warpgate.revert(actorToken.document, itemName);
			DAE.unsetFlag(actor, `spell-shillelagh`);
			ChatMessage.create({
				content: `${actorToken.name}'s ${itemName} returns to normal.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
