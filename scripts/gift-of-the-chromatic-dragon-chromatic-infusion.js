/*
	As a bonus action, you can touch a simple or martial weapon and infuse it with one of the following damage types: acid, cold, fire, lightning, or poison. For the next minute, the weapon deals an extra 1d4 damage of the chosen type when it hits. After you use this bonus action, you can't do so again until you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Gift of the Chromatic Dragon - Chromatic Infusion";
const flagName = "chromatic-infusion";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);

		// first check if there are any uses remaining
		let uses = lastArg.item?.system?.uses?.value ?? 0;
		if (uses < 1) {
			ui.notifications.error(`${optionName} - no uses remaining`);
			return false;
		}

		// find the target actor's eligible weapons
		let weapons = targetToken.actor.items.filter(i => (
			(i.type === `weapon`) && ["martialM", "martialR", "simpleM", "simpleR"].includes(i.system.weaponType)
		));
		if (weapons.length < 1) {
			ui.notifications.error(`${optionName} - ${targetToken.name} has no eligible items`);
			return false;
		}
		
		let target_content = ``;
		for (let ti of weapons) {
			target_content += `<option value=${ti.id}>${ti.name}</option>`;
		}

		let content = `
			<div class="form-group">
			  <div style="margin: 10px;">
				  <select name="titem">
					${target_content}
				  </select>
			  </div>
			</div>`;

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `⚔️ Choose the item to infuse`,
				content,
				buttons: {
					OK: {
						label: "<p>Infuse</p>",
						callback: async (html) => {
							let itemId = html.find('[name=titem]')[0].value;
							let selectedItem = targetToken.actor.items.get(itemId);
							resolve(selectedItem);
						}
					},
					Cancel: {
						label: "<p>Cancel</p>",
						callback: async (html) => {
							resolve(null);
						}
					}
				},
				default: "Cancel"
			}).render(true);
		});
		
		let itemToInfuse = await dialog;
		if (itemToInfuse) {
			// ask which type of damage to infuse
			let choice = false;
			let elementImg = {
				acid: "icons/magic/acid/projectile-smoke-glowing.webp",
				cold: "icons/magic/water/projectile-ice-snowball.webp",
				fire: "icons/magic/fire/projectile-fireball-smoke-orange.webp",  
				lightning: "icons/magic/lightning/projectile-orb-blue.webp",
				poison : "icons/magic/unholy/projectile-missile-green.webp"
			};

			let elementList = ["acid", "cold", "fire", "lightning", "poison"].reduce((list, element) => {
			  list[element] = {
				  icon: `<img style="display:block; width:100%; height:auto;" src="${elementImg[element]}" title="${capitalizeFirstLetter(element)}">`, 
				  callback: () => choice = element }
			  return list;
			}, {});

			let damageType = await new Promise((resolve) => {
				let x = new Dialog({
					title: 'Chromatic Infusion : Pick the damage type',
					buttons: elementList,
					default: "cancel",
					close: async () => {
						return resolve(choice);
					}
				});
				x.position.height = 115;
				return x.render(true);
			});			
			
			if (damageType) {
				// Apply the infusion
				const itemName = itemToInfuse.name;
				let mutations = {};
				const newName = `${itemName} (Chromatic Infusion)`;
				let damageParts = itemToInfuse.system.damage.parts;

				mutations[itemToInfuse.name] = {
					"name": newName,
					"system.damage.parts": [...damageParts, ['1d4',damageType]]
				};

				const updates = {
					embedded: {
						Item: mutations
					}
				};
				
				// mutate the selected item
				await warpgate.mutate(targetToken.document, updates, {}, { name: itemName });
						
				// track target info on the source actor
				DAE.setFlag(actor, flagName, { ttoken: targetToken.id, itemName : itemName });
				ChatMessage.create({content: targetToken.name + "'s " + itemName + " received the Chromatic Infusion from <b>" + actor.name + "</b>"});
				return true;
			}
		}
		
		return false;
	}
	else if (args[0] === "off") {
		let flag = DAE.getFlag(actor, flagName);
		if (flag) {
			DAE.unsetFlag(actor, flagName);
			const ttoken = canvas.tokens.get(flag.ttoken);
			const itemName = flag.itemName;
			let restore = await warpgate.revert(ttoken.document, itemName);
			ChatMessage.create({
				content: `${ttoken.name}'s ${itemName} returns to normal.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
	return false;
}

function capitalizeFirstLetter(str) {
	return str[0].toUpperCase() + str.slice(1);
}
