const version = "10.0.0";
const optionName = "Heat Metal";
const metalWeapons = ["Scimitar", "sword", "blade", "Rapier", "dagger", "mace"];
const metalArmor = ["medium", "heavy"];
const gameRound = game.combat ? game.combat.round : 0;
const ongoingDamageName = "Heat Metal - apply damage";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	let token = canvas.scene.tokens.get(lastArg.tokenId);	
	const level = Number(lastArg.spellLevel);

	if (args[0].macroPass === "postActiveEffects") {
		const target = (lastArg.targets ? canvas.tokens.get(lastArg.targets[0].id) : null);

		// find the target actor's weapons & armor that are metal
		let firstWeapons = target.actor.items.filter(i => (i.type === `weapon`));
		let armor = target.actor.items.filter(i => ((i.type === `equipment`) && metalArmor.includes(i.system.armor?.type) && (i.system.baseItem !== "hide")));
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
		if (targetItems.length < 1) {
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
						let isWeapon = selectedItem.type === `weapon`;

						// apply the blessing
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
						
						// track target info on the source actor
						DAE.setFlag(actor, `heat-metal`, {
							ttoken: target.id,
							itemName : itemName
						});
						
						// apply the effects to the target
						const ability = actor.system.attributes.spellcasting;
						const abilityBonus = actor.system.abilities[ability].mod;
						const dc = 8 + actor.system.attributes.prof + abilityBonus;
						let saveType = game.i18n.localize("con");
						await markTarget(target.actor.uuid, lastArg.item.uuid, dc, saveType);
						
						// add item to the source actor
						// TODO set the source
						const damageDice = 2 + Math.max(level - 2, 0);
						const sourceActorUpdates = {
							embedded: {
								Item: {
									"Heat Metal - apply damage": { 
										type: "feat",
										img: "icons/tools/smithing/furnace-fire-metal-orange.webp",
										data: {
											description: {
												value: `${optionName}`
											},
											activation: {
												type: "bonus",
												cost: 1
											},
											actionType: "util",
											damage: {
												parts: [
													[`${damageDice}d8`, "fire"]
												]
											},
										}
									}
								}
							}
						};						
						await warpgate.mutate(token, sourceActorUpdates);

						ChatMessage.create({content: target.actor.name + "'s " + itemName + " becomes red-hot!"});
						return true;
					}
				},
				Cancel:
				{
					label: `Cancel`,
					callback: async (html) => {
						return false;
					}
				}
			}
		}).render(true);
	}
	else if (args[0] === "off") {
		let flag = DAE.getFlag(actor, `heat-metal`);
		if (flag) {
			// revert the actor
			await warpgate.revert(token, ongoingDamageName);
			
			// revert the target
			const ttoken = canvas.tokens.get(flag.ttoken);
			const itemName = flag.itemName;
			let restore = await warpgate.revert(ttoken.document, itemName);
			
			DAE.unsetFlag(actor, `heat-metal`);
			ChatMessage.create({
				content: `${ttoken.name}'s ${itemName} returns to normal.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}

async function markTarget(targetId, itemId, spellDC, saveType) {
	const effectData = {
		label: optionName,
		icon: "icons/tools/smithing/furnace-fire-metal-orange.webp",
		origin: itemId,
		changes: [
            {
				key: `flags.midi-qol.OverTime`, 
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, 
				value: `turn=start,label=${optionName},saveDC=${spellDC},saveAbility=${saveType},saveRemove=false`, 
				priority: 20
			},
			{
				key: 'flags.midi-qol.disadvantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "1",
				priority: 21
			},
			{
				key: 'flags.midi-qol.disadvantage.ability.check.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "1",
				priority: 22
			}
		],
		duration: { 
			rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime 
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
