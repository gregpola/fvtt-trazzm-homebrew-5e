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
const version = "11.0";
const optionName = "Heat Metal";
const metalWeapons = ["Scimitar", "sword", "blade", "Rapier", "dagger", "mace"];
const metalArmor = ["medium", "heavy"];
const gameRound = game.combat ? game.combat.round : 0;
const flagName = "heat-metal";
const effectName = "heat-metal-effect";
const mutationName = "heat-metal-mutation";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const spellLevel = workflow.castData.castLevel;
		const damageDice = 2 + Math.max(spellLevel - 2, 0);
		const target = workflow.targets.first();

		// find the target actor's weapons & armor that are metal
		let firstWeapons = target.actor.items.filter(i => (i.type === `weapon` && i.system.equipped));
		let armor = target.actor.items.filter(i => ((i.type === `equipment`) && i.system.equipped && metalArmor.includes(i.system.armor?.type) && (i.system.baseItem !== "hide")));
		let targetItems = new Set();
		
		for (let weapon of firstWeapons) {
			for (var i = 0; i < metalWeapons.length; i++) {
				if (weapon.name.includes(metalWeapons[i])) {
					targetItems.add(weapon);
					break;
				}
			}
		}

		armor.forEach(item => targetItems.add(item));
		if (targetItems.size < 1) {
			return ui.notifications.error(`${optionName} - ${target.actor.name} has no eligible items`);
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
							let selectedItem = target.actor.items.get(itemId);
							const itemName = selectedItem.name;

							// apply the heat
							const newName = itemName + ` (${optionName})`;
							
							let mutations = {};
							mutations[selectedItem.name] = {
								"name": newName
							};
							
							const updates = {
								embedded: {
									Item: mutations
								}
							};

							// mutate the selected item
							await warpgate.mutate(target.document, updates, {}, { name: itemName });
							// TODO add in option to drop the item, for now handled manually


							// Apply the actor effect
							let actorEffectData = {
								'name': effectName,
								'icon': workflow.item.img,
								'origin': workflow.item.uuid,
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


							// track target info on the source actor
							DAE.setFlag(actor, flagName, {tokenId: target.id, itemName: itemName, origin: workflow.item.uuid, damageDice: damageDice});
							ChatMessage.create({content: target.actor.name + "'s " + itemName + " becomes red-hot!"});
							resolve(true);
						}
					}
				}
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			const actorData = actor.getRollData();
			let damageRoll = await new game.dnd5e.dice.DamageRoll(`${damageDice}d8[fire]`, actorData).evaluate({async:false});
			await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [target], damageRoll, { flavor: `(${optionName})`, itemCardId: "new" });
			await game.dice3d?.showForRoll(damageRoll);
		}
		return useFeature;		
	}
	else if (args[0] === "each") {
		// ask if they want to apply the damage as a bonus action
		let effectedTarget = undefined;
		let flag = DAE.getFlag(actor, flagName);
		if (flag) {
			// get the target actor
			const targetToken = canvas.scene.tokens.get(flag.tokenId);
			if (targetToken) {
				let effect = targetToken.actor.effects.find(f => f.name === effectName && f.origin === flag.origin);
				if (effect) {
					effectedTarget = targetToken;
				}
			}
		}

		if (effectedTarget) {
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: optionName,
					content: `<p>Use a bonus action to apply damage to ${effectedTarget.name}?</p>`,
					buttons: {
						yes: {
							icon: '<p> </p><img src = "icons/tools/smithing/furnace-fire-metal-orange.webp" width="50" height="50"></>',
							label: "<p>Yes</p>",
							callback: () => resolve(true)
						},
						no: {
							icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
							label: "<p>No</p>",
							callback: () => {
								resolve(false)
							}
						}
					},
					default: "two"
				}).render(true);
			});

			let useFeature = await dialog;
			if (useFeature) {
				// apply damage to effectedTarget
				const actorData = actor.getRollData();
				let damageRoll = await new game.dnd5e.dice.DamageRoll(`${flag.damageDice}d8[fire]`, actorData).evaluate({async:false});
				await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [effectedTarget], damageRoll, { flavor: `(${optionName})`, itemCardId: "new" });
				await game.dice3d?.showForRoll(damageRoll);
			}
		}
	}
	else if (args[0] === "off") {
		let flag = DAE.getFlag(actor, flagName);
		if (flag) {
			// get the target actor
			let targetToken = canvas.scene.tokens.get(flag.tokenId);
			if (targetToken) {
				// revert the heated item
				const itemName = flag.itemName;
				await warpgate.revert(targetToken, itemName);

				// remove the effect
				let effect = targetToken.actor.effects.find(f => f.name === effectName);
				if (effect) {
					await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
				}

				ChatMessage.create({
					content: `${targetToken.name}'s ${itemName} returns to normal.`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});
			}
			DAE.unsetFlag(actor, flagName);
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
