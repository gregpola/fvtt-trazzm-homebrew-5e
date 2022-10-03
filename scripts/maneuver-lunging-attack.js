const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Lunging Attack";

try {
	let actor = MidiQOL.MQfromActorUuid(args[1].actorUuid);
		
	if (args[0] === "on") {
		const target = Array.from(game.user.targets)[0];

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}
		
		// find the actor's weapons
		// TODO filter to only mw
		let weapons = actor.items.filter(i => i.data.type === `weapon`);
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
						let weaponItem = actor.items.get(itemId);

						let copy_item = duplicate(weaponItem.toObject());
						DAE.setFlag(actor, `lunging-attack-weapon`, {
							id : itemId,
							damage : copy_item.data.damage.parts[0][0],
							range : copy_item.data.range
						});
						let damage = copy_item.data.damage.parts[0][0];
						const supDie = actor.data.data.scale["battle-master"]["superiority-die"];
						var newdamage = damage + " + " + supDie;
						copy_item.data.damage.parts[0][0] = newdamage;
						copy_item.data.range += 5;
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
		let flag = DAE.getFlag(actor, `lunging-attack-weapon`);
		if (flag) {
			let weaponItem = actor.items.get(flag.id);
			let copy_item = duplicate(weaponItem.toObject());
			copy_item.data.damage.parts[0][0] = flag.damage;
			copy_item.data.range = flag.range;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(actor, `lunging-attack-weapon`);
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}