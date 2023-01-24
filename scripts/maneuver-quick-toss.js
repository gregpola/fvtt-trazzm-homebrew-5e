const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Quick Toss";
const flagName = "quick-toss-weapon";

try {
	let actor = MidiQOL.MQfromActorUuid(args[1].actorUuid);
		
	if (args[0] === "on") {
		const target = Array.from(game.user.targets)[0];

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}
		
		// find the actor's thrown weapons
		let weapons = actor.items.filter(i => i.type === `weapon` && i.system.properties.thr);
		let weapon_content = ``;
		for (let weapon of weapons) {
			weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
		}
		
		if (weapon_content.length === 0) {
			return ui.notifications.error(`${resourceName} - no thrown weapons found`);
		}

		let content = `
			<div class="form-group">
			  <label>Weapons : </label>
			  <select name="weapons">
				${weapon_content}
			  </select>
			  <br />
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

						let copy_item = duplicate(weaponItem.toObject());
						DAE.setFlag(actor, flagName, {
							id : itemId,
							damage : copy_item.system.damage.parts[0][0]
						});
						let damage = copy_item.system.damage.parts[0][0];
						const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
						var newdamage = damage + " + " + fullSupDie.die;
						copy_item.system.damage.parts[0][0] = newdamage;
						actor.updateEmbeddedDocuments("Item", [copy_item]);

						let theItem = actor.items.get(itemId);
						await theItem.roll();
						await consumeResource(actor, resKey, 1);
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
			let weaponItem = actor.items.get(flag.id);
			let copy_item = duplicate(weaponItem.toObject());
			copy_item.system.damage.parts[0][0] = flag.damage;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(actor, flagName);
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
