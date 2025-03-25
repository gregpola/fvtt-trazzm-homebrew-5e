/*
	You have learned how to imbue yourself with the might of giants. As a bonus action, you magically gain the following benefits, which last for 1 minute:

		* If you are smaller than Large, you become Large, along with anything you are wearing. If you lack the room to become Large, your size doesn’t change.

		* You have advantage on Strength checks and Strength saving throws.
		
		* Once on each of your turns, one of your attacks with a weapon or an unarmed strike can deal an extra 1d6 damage to a target on a hit.

	You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses of it when you finish a long rest.
*/
const version = "12.3.0";
const optionName = "Giant’s Might";
const timeFlag = "giants-might-time";
const effectName = `${optionName} - enlarged`;

try {
	if (args[0] === "on") {
		let newSize = "large";
		let runicJuggs = actor.items.getName("Runic Juggernaut");
		if (runicJuggs) {
			// ask what size they want to grow to
			const content = `
			<p>What size do you want to grow to?</p>
			<label style="margin-bottom: 10px;"><input type="radio" name="choice" value="large" checked>  Large </label>
			<label style="margin-bottom: 10px;"><input type="radio" name="choice" value="huge">  Huge </label>`;

			newSize = await foundry.applications.api.DialogV2.prompt({
				content: content,
				rejectClose: false,
				ok: {
					callback: (event, button, dialog) => {
						return button.form.elements.choice.value;
					}
				},
				window: {
					title: `${optionName}`,
				},
				position: {
					width: 400
				}
			});
		}

		if (newSize) {
			let effectData = {
				name: effectName,
				icon: item.img,
				changes: [],
				origin: item.uuid,
				disabled: false
			};

			if (newSize === "large") {
				effectData.changes.push(
					{
						key: 'system.traits.size',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: 'lg',
						priority: 22
					}
				);
				effectData.changes.push(
					{
						key: 'ATL.width',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: 2,
						priority: 23
					}
				);
				effectData.changes.push(
					{
						key: 'ATL.height',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: 2,
						priority: 24
					}
				);
			}
			else if (newSize === "huge") {
				effectData.changes.push(
					{
						key: 'system.traits.size',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: 'huge',
						priority: 22
					}
				);
				effectData.changes.push(
					{
						key: 'ATL.width',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: 3,
						priority: 23
					}
				);
				effectData.changes.push(
					{
						key: 'ATL.height',
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						value: 3,
						priority: 24
					}
				);
			}

			await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
		}
	}
	else if (args[0] === "off") {
		await HomebrewEffects.removeEffectByNameAndOrigin(actor, effectName, item.uuid);
	}
	else if (args[0].macroPass === "DamageBonus") {
		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}
		
		// check once per turn
		if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
			// ask if they want to use it
			let useFeature = await foundry.applications.api.DialogV2.confirm({
				window: {
					title: `${optionName}`,
				},
				content: `<p>Add extra damage to this attack (once per turn)?</p>`,
				rejectClose: false,
				modal: true
			});

			if (useFeature) {
				await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

				const diceCount = workflow.isCritical ? 2: 1;
				let die = "d6";
				let greatStature = actor.items.getName("Great Stature");
				if (greatStature) {
					die = "d8";
				}
				let runicJuggs = actor.items.getName("Runic Juggernaut");
				if (runicJuggs) {
					die = "d10";
				}
				
				return {damageRoll: `${diceCount}${die}`, flavor: optionName};
			}
		}		
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
