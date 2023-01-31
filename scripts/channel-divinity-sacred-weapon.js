const version = "0.1.0";
const resourceName = "Channel Divinity";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0] === "on") {
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = tactor.data.data.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}

		// find the actor's weapons
		let weapons = tactor.items.filter(i => i.data.type === `weapon`);
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
						let weaponItem = tactor.items.get(itemId);
						let copy_item = duplicate(weaponItem.toObject());
						DAE.setFlag(tactor, `sacred-weapon`, {
							id : itemId,
							damage : copy_item.data.damage.parts[0][0],
							magic : copy_item.data.properties.mgc						
						});
						let damage = copy_item.data.damage.parts[0][0];
						var newdamage = damage + " + @abilities.cha.mod";
						copy_item.data.damage.parts[0][0] = newdamage;
						copy_item.data.properties.mgc = true;
						tactor.updateEmbeddedDocuments("Item", [copy_item]);
						ChatMessage.create({content: copy_item.name + " is sacred"});
						
						// create the light effect
						addLightEffects( tactor, args[1]);
						
						await consumeResource(tactor, resKey, 1);
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
		let flag = DAE.getFlag(tactor, `sacred-weapon`);
		if (flag) {
			let effect = await findEffect(tactor, "sacred-weapon-light");
			if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [effect.id] });
			
			let weaponItem = tactor.items.get(flag.id);
			let copy_item = duplicate(weaponItem.toObject());
			copy_item.data.damage.parts[0][0] = flag.damage;
			copy_item.data.properties.mgc = flag.magic;
			await tactor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(tactor, `sacred-weapon`);
			ChatMessage.create({content: copy_item.name + " returns to normal"});
		}
	}
	
} catch (err) {
	console.error(`Channel Divinity: Sacred Weapon ${version}`, err);
}

// find the resource
function findResource(actor) {
	if (actor) {
		for (let res in actor.data.data.resources) {
			if (actor.data.data.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}

// Add the light effect to the actor
async function addLightEffects(target, origin) {
    const effectData = {
        label: "sacred-weapon-light",
        icon: "icons/magic/light/beam-rays-yellow-blue-large.webp",
        origin: origin.origin,
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

// Function to test for an effect
async function findEffect(actor, effectName) {
    let effectUuid = null;
    effectUuid = actor?.data.effects.find(ef => ef.data.label === effectName);
    return effectUuid;
}
