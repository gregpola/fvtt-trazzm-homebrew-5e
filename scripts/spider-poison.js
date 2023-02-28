const version = "10.0.2";
const optionName = "Spider Poison";
const flagName = "spider-poison-weapon";
const damageDice = "2d8";
const saveDC = 11;
const saveFlavor = `${CONFIG.DND5E.abilities["con"]} DC${saveDC} ${optionName}`;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
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
								"name": `${selectedItem.name} (${optionName})`
							};
													
							const updates = {
								embedded: {
									Item: mutations
								}
							};
							
							// mutate the selected item
							await warpgate.mutate(actorToken.document, updates, {}, { name: itemName });
							
							// check weapon type to see if it should be single or triple use
							let useCount = 1;
							if ((selectedItem.system.actionType === "rwak") && (selectedItem.system.properties.amm)) {
								useCount = 3;
							}
													
							// track target info on the actor
							await DAE.setFlag(actor, flagName, {itemName: itemName, itemId: itemId, applications: useCount } );
							ChatMessage.create({content: itemName + " is poisoned"});
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
		// poison only lasts one hit for most weapons, three for ammo
		let flag = DAE.getFlag(actor, flagName);
		if (flag && lastArg.item._id === flag.itemId) {
			let apps = flag.applications;
			const itemName = flag.itemName;
			const itemId = flag.itemId;
			
			// check for expiration condition
			if (apps < 2) {
				await warpgate.revert(actorToken.document, itemName);
				DAE.unsetFlag(actor, flagName);
				ChatMessage.create({content: itemName + " returns to normal"});
			
				// remove the DamageBonus effect from the actor
				let effect = await findEffect(actor, optionName);
				if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
			}
			else {
				apps -= 1;
				await DAE.unsetFlag(actor, flagName);
				await DAE.setFlag(actor, flagName, {itemName: itemName, itemId: itemId, applications: apps } );
			}
			
			// apply the poison damage
			let targetActor = (await fromUuid(lastArg.hitTargetUuids[0]))?.actor;			
			const uuid = targetActor.uuid;
			const damageRoll = await new Roll(`${damageDice}`).evaluate({ async: false });
			await game.dice3d?.showForRoll(damageRoll);

			let saveRoll = await targetActor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});
			if (saveRoll.total < saveDC) {
				return {damageRoll: `${damageRoll.total}[poison]`, flavor: `${optionName} Damage`};		
			}
			else {
				const dmg = Math.ceil(damageRoll.total/2);
				return {damageRoll: `${dmg}[poison]`, flavor: `${optionName} Damage`};		
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function findEffect(actor, effectName) {
    let effect = null;
    effect = actor?.effects.find(ef => ef.label === effectName);
    return effect;
}
