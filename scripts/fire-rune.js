/*
	In addition, when you hit a creature with an attack using a weapon, you can invoke the rune to summon fiery shackles: the target takes an extra 2d6 fire damage, and it must succeed on a Strength saving throw or be Restrained for 1 minute. While restrained by the shackles, the target takes 2d6 fire damage at the start of each of its turns. The target can repeat the saving throw at the end of each of its turns, banishing the shackles on a success. Once you invoke this rune, you can’t do so again until you finish a short or long rest.
*/
const version = "10.0.0";
const optionName = "Fire Rune";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "DamageBonus") {
		let itemData = lastArg.itemData;
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetActor = lastArg.hitTargets[0].actor;

		// Skip if the action isn't an weapon attack roll
		if (!["mwak", "rwak"].includes(itemData.system.actionType)) {
			console.log(`${optionName} - action type isn't applicable`);
			return {};
		}
		
		// make sure the feature has uses available
		let featureItem = actor.items.getName(optionName);
		if (!featureItem) {
			ui.notifications.error(`${optionName} - feature not found`);
			return {};
		}
		
		const usesLeft = featureItem.system.uses?.value ?? 0;
		if (!usesLeft) {
			console.error(`${optionName} - out of uses`);
			return {};
		}
		
		// ask if they want to use the feature
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: 'Rune Knight',
				content: `<p>Use ${optionName}?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/symbols/runes-carved-stone-red.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			// reduce feature uses
			await featureItem.update({ "system.uses.value": usesLeft - 1 });
			
			// run save or be restrained
			const pb = actor.system.attributes.prof ?? 2;
			const conMod = actor.system.abilities.con.mod;
			const saveDC = 8 + pb + conMod;

			const saveFlavor = `${CONFIG.DND5E.abilities["str"]} DC${saveDC} ${optionName}`;
			let saveRoll = await targetActor.rollAbilitySave("str", {flavor: saveFlavor, damageType: "fire"});
			await game.dice3d?.showForRoll(saveRoll);
			
			if (saveRoll.total < saveDC) {
				let restrainedEffect = {
					'label': 'Restrained by Fiery Shackles',
					'icon': 'icons/magic/symbols/runes-carved-stone-red.webp',
					'changes': [
						{
							'key': 'flags.midi-qol.OverTime',
							'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
							'value': `turn=end, saveAbility=str, saveDC=${saveDC}, label=Restrained Save`,
							'priority': 20
						},
						{
							'key': 'flags.midi-qol.OverTime',
							'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
							'value': `turn=start, damageRoll=2d6, damageType=fire, label=Fiery Shackles`,
							'priority': 21
						},
						{
							'key': 'macro.CE',
							'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							'value': 'Restrained',
							'priority': 22
						}
					],
					'origin': lastArg.itemUuid,
					'duration': {'seconds': 60}
				};
				await targetActor.createEmbeddedDocuments("ActiveEffect", [restrainedEffect]);
			}
				
			// return initial damage bonus
			const diceCount = lastArg.isCritical ? 4: 2;
			return {damageRoll: `${diceCount}d6[fire]`, flavor: optionName};
		}		
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
