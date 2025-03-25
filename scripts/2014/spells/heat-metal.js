/*
	Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see
	within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 fire
	damage when you cast the spell. Until the spell ends, you can use a bonus action on each of your subsequent turns to
	cause this damage again.

	If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a
	Constitution saving throw or drop the object if it can. If it doesn't drop the object, it has disadvantage on attack
	rolls and ability checks until the start of your next turn.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for each slot level above 2nd.
*/
const version = "12.3.0";
const optionName = "Heat Metal";
const metalWeapons = ["scimitar", "sword", "blade", "rapier", "dagger", "mace", "knife"];
const metalArmor = ["medium", "heavy"];
const gameRound = game.combat ? game.combat.round : 0;
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "heat-metal";
const effectName = "heat-metal-effect";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const damageDice = workflow.castData.castLevel;
		const target = workflow.targets.first();
		if (!target) return;

		let targetItemName;
		let selectedItem;

		// find the target actor's weapons & armor that are metal
		let firstWeapons = target.actor.items.filter(i => (i.type === `weapon` && i.system.equipped));
		let armor = target.actor.items.filter(i => ((i.type === `equipment`) && i.system.equipped && metalArmor.includes(i.system.armor?.type) && (i.system.baseItem !== "hide")));
		let targetItems = new Set();
		
		for (let weapon of firstWeapons) {
			for (var i = 0; i < metalWeapons.length; i++) {
				if (weapon.name.toLowerCase().includes(metalWeapons[i])) {
					targetItems.add(weapon);
					break;
				}
			}
		}

		armor.forEach(item => targetItems.add(item));
		if (targetItems.size < 1) {
			ui.notifications.error(`${optionName} - ${target.actor.name} has no eligible items`);
			return;
		}
		
		let target_content = ``;
		for (let ti of targetItems) {
			target_content += `<option value=${ti.id}>${ti.name}</option>`;
		}

		let content = `
			<div class="form-group">
			  <label>Weapons and Armor:</label>
			  <div style="margin: 10px;">
				  <select name="titem">
					${target_content}
				  </select>
			  </div>
			</div>`;

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `⚔️ Choose the item to heat`,
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							let itemId = html.find('[name=titem]')[0].value;
							selectedItem = target.actor.items.get(itemId);
							targetItemName = selectedItem.name;

							// apply the heat
							const newName = targetItemName + ` (${optionName})`;
							let mutations = {
								"name": newName
							};

							// Update the weapon name to show it as poisoned
							await selectedItem.update(mutations);

							// Apply the heated effect to the target
							let actorEffectData = {
								'name': effectName,
								'icon': workflow.item.img,
								'origin': workflow.actor.uuid,
								"duration": {
									rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime
								},
								"changes": [
									{
										"key": "macro.tokenMagic",
										"mode": 0,
										"value": "Fire v2 (sparks)",
										"priority": 21
									},
									{
										"key": "flags.midi-qol.disadvantage.attack.all",
										"mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
										"value": `true`,
										"priority": 22
									},
									{
										"key": "flags.midi-qol.disadvantage.ability.check.all",
										"mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
										"value": `true`,
										"priority": 23
									}
								],
								"flags": {
								}
							};
							await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': target.actor.uuid, 'effects': [actorEffectData]});
							ChatMessage.create({content: target.actor.name + "'s " + targetItemName + " becomes red-hot!"});
							resolve(true);
						}
					}
				}
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			// track target info to the caster
			await actor.setFlag(_flagGroup, flagName, {tokenId: target.id, origin: actor.uuid, itemName: targetItemName, itemId: selectedItem.id});

			// add the ongoing damage item to the caster
			let ongoingDamageItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Heat Metal Damage');
			if (ongoingDamageItem) {
				let damageParts = ongoingDamageItem.system.damage.parts;
				damageParts[0][0] = `${damageDice}${damageParts[0][0].substring(1)}`;
				ongoingDamageItem.system.damage.parts = damageParts;
				await actor.createEmbeddedDocuments("Item", [ongoingDamageItem]);
				const favoriteItem = actor.items.find(i => i.name === "Heat Metal Damage");
				if (favoriteItem) {
					let favorites = foundry.utils.deepClone(actor.system.favorites);
					favorites.push({type: "item", id: favoriteItem.getRelativeUUID(actor)});
					await actor.update({ "system.favorites": favorites });
				}
			}

			// TODO add an option to drop the item to the target, for now handled manually

			// Apply the initial damage to the target
			const actorData = actor.getRollData();
			let damageRoll = await new game.dnd5e.dice.DamageRoll(`${damageDice}d8[fire]`, actorData).evaluate();
			await game.dice3d?.showForRoll(damageRoll);
			await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [target], damageRoll, { flavor: `(${optionName})`, itemCardId: args[0].itemCardId });
		}
	}
	else if (args[0] === "off") {
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, flagName);

			// get the target actor
			let targetToken = canvas.scene.tokens.get(flag.tokenId);
			if (targetToken) {
				// revert the heated item
				let heatedEffect = targetToken.actor.effects.find(eff => eff.name === effectName);
				if (heatedEffect) {
					await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': targetToken.actor.uuid, 'effects': [heatedEffect.id]});
				}

				const heatedItem = targetToken.actor.items.get(flag.itemId);
				if (heatedItem) {
					let mutations = {
						"name": flag.itemName
					};

					// Update the weapon name to show it as poisoned
					await heatedItem.update(mutations);
				}

				ChatMessage.create({
					content: `${targetToken.name}'s ${flag.itemName} returns to normal.`,
					speaker: ChatMessage.getSpeaker({ actor: targetToken.actor })});
			}
		}

		// remove the apply damage item from the source actor
		const ongoingDamageItem = actor.items.find(i => i.name === "Heat Metal Damage");
		if (ongoingDamageItem) {
			ongoingDamageItem.delete();
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
