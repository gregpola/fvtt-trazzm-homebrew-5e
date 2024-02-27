drow-poison.js/*
	This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or be Poisoned for 1 hour. If the saving throw fails by 5 or more, the creature is also Unconscious while poisoned in this way. The creature wakes up if it takes damage or if another creature takes an action to shake it awake.
*/
const version = "11.2";
const optionName = "Drow Poison";
const flagName = "drow-poison-weapon";
const saveDC = 13;

try {
	if (args[0].macroPass === "preItemRoll") {
		// find the actor's items that can be poisoned
		// must be piercing or slashing
		let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
		if (!weapons || weapons.length < 1) {
			ui.notifications.error(`${optionName} - no appropriate weapons available`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {

		let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
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
						callback: async (html) => {
							let itemId = html.find('[name=weapons]')[0].value;
							let selectedItem = actor.items.get(itemId);
							const itemName = selectedItem.name;

							let mutations = {};
							mutations[selectedItem.name] = {
								"name": `${selectedItem.name} (${optionName})`,
							};

							const updates = {
								embedded: {
									Item: mutations
								}
							};

							// mutate the selected item
							await warpgate.mutate(token.document, updates, {}, { name: itemName });

							// check weapon type to see if it should be single or triple use
							let useCount = 1;
							if ((selectedItem.system.actionType === "rwak") && (selectedItem.system.properties.amm)) {
								useCount = 3;
							}

							// track target info on the actor
							await DAE.setFlag(actor, flagName, {itemName: itemName, itemId: itemId, applications: useCount } );
							ChatMessage.create({content: itemName + " is coated"});
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
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			// poison only lasts one hit for most weapons, three for ammo
			let flag = DAE.getFlag(actor, flagName);
			if (flag && workflow.item._id === flag.itemId) {
				let apps = flag.applications;
				const itemName = flag.itemName;
				const itemId = flag.itemId;

				// check for expiration condition
				if (apps < 2) {
					await warpgate.revert(token.document, itemName);
					DAE.unsetFlag(actor, flagName);
					ChatMessage.create({content: itemName + " returns to normal"});

					// remove the DamageBonus effect from the actor
					let effect = await findEffect(actor, optionName);
					if (effect) await MidiQOL.socket().executeAsGM("removeEffects", {
						actorUuid: actor.uuid,
						effects: [effect.id]
					});
				} else {
					apps -= 1;
					await DAE.unsetFlag(actor, flagName);
					await DAE.setFlag(actor, flagName, {itemName: itemName, itemId: itemId, applications: apps});
				}

				// request the saving throw
				await game.MonksTokenBar.requestRoll([{token: targetToken}], {
					request: [{"type": "save", "key": "con"}],
					dc: saveDC, showdc: true,
					silent: true, fastForward: false,
					flavor: `${optionName} (poison)`,
					rollMode: 'roll',
					callback: async (result) => {
						for (let tr of result.tokenresults) {
							if (!tr.passed) {
								if (tr.roll.total <= (saveDC - 5)) {
									await applyUnconsciousEffect(actor, targetToken.actor);
								}
								else {
									await applyPoisonedEffect(actor, targetToken.actor);
								}
							}
						}
					}
				});
			}
		}

		return {};
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function findEffect(actor, effectName) {
    let effect = null;
    effect = actor?.effects.find(ef => ef.name === effectName);
    return effect;
}

async function applyPoisonedEffect(actor, target) {

    let effectData = [{
        name: optionName,
        icon: 'icons/consumables/potions/potion-labeled-poison-white.webp',
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
        name: optionName,
        icon: 'icons/consumables/potions/potion-labeled-poison-white.webp',
        origin: actor.uuid,
        transfer: false,
        disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 3600},
        changes: [
			{ key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 },
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Unconscious", priority: 21 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}
