const version = "10.0.0";
const optionName = "Drow Poison";
const flagName = "drow-poison-weapon";
const saveDC = 13;
const saveFlavor = `${CONFIG.DND5E.abilities["con"]} DC${saveDC} ${optionName}`;

const lastArg = args[args.length - 1];

// Add poison effect to the weapon
// After hitting, remove effect
try {
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		// find the actor's items that can be poisoned
		// must be piercing or slashing
		let weapons = tactor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
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
			const uuid = targetActor.uuid;
			let saveRoll = await targetActor.rollAbilitySave("con", {saveFlavor});
			await game.dice3d?.showForRoll(saveRoll);
			
			if (saveRoll.total < (saveDC - 5)) {
				await applyPoisonedEffect(tactor, targetActor);
				await applyUnconsciousEffect(tactor, targetActor);				
			}
			else if (saveRoll.total < saveDC) {
				await applyPoisonedEffect(tactor, targetActor);
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function findEffect(actor, effectName) {
    let effectUuid = null;
    effectUuid = actor?.effects.find(ef => ef.label === effectName);
    return effectUuid;
}

async function applyPoisonedEffect(actor, target) {

    let effectData = [{
        label: optionName,
        icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
        origin: actor.uuid,
        transfer: false,
        disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 3600},
        changes: [
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}

async function applyUnconsciousEffect(actor, target) {

    let effectData = [{
        label: optionName,
        icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
        origin: actor.uuid,
        transfer: false,
        disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 3600},
        changes: [
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Unconscious", priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}

