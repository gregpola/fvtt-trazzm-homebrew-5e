const version = "0.1.0";
const optionName = "Poisonous Snake Venom";
const flagName = "poisonous-snake-venom-weapon";
const damageDice = "2d4";
const saveDC = 10;
const saveFlavor = `${CONFIG.DND5E.abilities["con"]} DC${saveDC} ${optionName}`;

// Add poison effect to the weapon
// After hitting, remove effect

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		// find the actor's items that can be poisoned
		// must be piercing or slashing
		let weapons = tactor.items.filter(i => i.data.type === `weapon` && (i.data.data.damage.parts[0][1] === `piercing` || i.data.data.damage.parts[0][1] === `slashing`));
		if (!weapons || weapons.length < 1) {
			ui.notifications.error(`${optionName} - no appropriate weapons available`);
			return false;
		}
		
		let weapon_content = ``;
		for (let weapon of weapons) {
			weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
		}

		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Choose your weapon to poison:</label></div>
				<div class="flexrow"style="margin-bottom: 10px;">
					<select name="weapons">${weapon_content}</select>
				</div>
			</div>
		  </form>
		`;

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: content,
				buttons: {
					one: {
						label: "<p>OK</p>",
						callback: (html) => {
							let itemId = html.find('[name=weapons]')[0].value;
							let weaponItem = tactor.items.get(itemId);
							let copy_item = duplicate(weaponItem.toObject());
							DAE.setFlag(tactor, flagName, {
								id : itemId,
								name : copy_item.name
							});
							copy_item.name = copy_item.name + " (poisoned)";
							tactor.updateEmbeddedDocuments("Item", [copy_item]);
							ChatMessage.create({content: copy_item.name + " is poisoned"});
							resolve(true);
						}
					},
					two: {
						label: "<p>Cancel</p>",
						callback: () => { 
							resolve(false);
						}
					}
				},
				default: "two"
			}).render(true);
		});

		let result = await dialog;
		return result;
		
	}
	else if (args[0].macroPass === "DamageBonus") {
		// poison only lasts one hit
		let flag = DAE.getFlag(tactor, flagName);
		if (flag && lastArg.item._id === flag.id) {
			let weaponItem = tactor.items.get(flag.id);
			let copy_item = duplicate(weaponItem.toObject());
			copy_item.name = flag.name;
			await tactor.updateEmbeddedDocuments("Item", [copy_item]);
			DAE.unsetFlag(tactor, flagName);
			ChatMessage.create({content: copy_item.name + " returns to normal"});
			
			// remove the DamageBonus effect from the actor
			let effect = await findEffect(tactor, optionName);
			if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [effect.id] });
			
			// apply the poison damage
			let targetActor = (await fromUuid(lastArg.hitTargetUuids[0]))?.actor;			
			let saveRoll = (await targetActor.rollAbilitySave("con", {saveFlavor})).total;
			if (saveRoll < saveDC) {
				return {damageRoll: `${damageDice}[poison]`, flavor: `${optionName} Damage`};		
			}
			else {
				return {damageRoll: `${damageDice}/2[poison]`, flavor: `${optionName} Damage`};		
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function findEffect(actor, effectName) {
    let effectUuid = null;
    effectUuid = actor?.data.effects.find(ef => ef.data.label === effectName);
    return effectUuid;
}
