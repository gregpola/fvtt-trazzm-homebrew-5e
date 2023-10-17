const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Lunging Attack";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(tactor, resKey, 1);
	}
	else if (args[0] === "on") {
		const target = Array.from(game.user.targets)[0];
		
		// find the actor's weapons
		let weapons = tactor.items.filter(i => i.data.type === `weapon`);
		let weapon_content = ``;
		for (let weapon of weapons) {
			if (weapon.data.data.actionType === "mwak") {
				weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
			}
		}
		
		if (weapon_content.length === 0) {
			return ui.notifications.error(`${resourceName} - no melee weapons found`);
		}

		let content = `
			<div class="form-group">
			  <label>Weapons : </label>
			  <select name="weapons">
				${weapon_content}
			  </select>
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
						let weaponItem = tactor.items.get(itemId);

						let copy_item = duplicate(weaponItem.toObject());
						DAE.setFlag(tactor, `lunging-attack-weapon`, {
							id : itemId,
							damage : copy_item.system.damage.parts[0][0],
							range : copy_item.system.range.value
						});
						let damage = copy_item.system.damage.parts[0][0];
						const fullSupDie = tactor.system.scale["battle-master"]["superiority-die"];
						var newdamage = damage + " + " + fullSupDie.die;
						copy_item.system.damage.parts[0][0] = newdamage;
						copy_item.system.range.value += 5;
						await tactor.updateEmbeddedDocuments("Item", [copy_item]);
						let theItem = actor.items.get(itemId);
						await theItem.roll();
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
		let flag = DAE.getFlag(tactor, `lunging-attack-weapon`);
		if (flag) {
			let weaponItem = tactor.items.get(flag.id);
			let copy_item = duplicate(weaponItem.toObject());
			copy_item.system.damage.parts[0][0] = flag.damage;
			copy_item.system.range.value = flag.range;
			await tactor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(tactor, `lunging-attack-weapon`);
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
