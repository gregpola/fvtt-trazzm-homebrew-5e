const version = "12.3.1";
const optionName = "Absorb Elements";
const elements = { acid: "acid", cold: "cold", fire: "fire", lightning: "lightning", thunder: "thunder" };
const meleeEffectName = "Absorb Elements (Melee Damage)";
const resistanceEffectName = "Absorb Elements (Resistance)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Ask the player for the damage type
		let content = `
            <label><input type="radio" name="choice" value="acid" checked>  Acid </label>
            <label><input type="radio" name="choice" value="cold">  Cold </label>
            <label><input type="radio" name="choice" value="fire">  Fire </label>
            <label><input type="radio" name="choice" value="lightning">  Lightning </label>
            <label><input type="radio" name="choice" value="thunder">  Thunder </label>
        `;

		let flavor = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.choice.value;
				}
			},
			window: {
				title: `${optionName} - Select the Damage Type`,
			},
			position: {
				width: 400
			}
		});

		if (flavor) {
			const spellLevel = workflow.castData.castLevel;
			let targetToken = workflow.targets.firsts();

			// update the melee damage
			let effect = HomebrewHelpers.findEffect(targetToken.actor, meleeEffectName);
			let changes;
			if (effect) {
				changes = foundry.utils.duplicate(effect.changes);
				changes[0].value = `${spellLevel}d6[${flavor}]`;
				changes[1].value = `${spellLevel}d6[${flavor}]`;
				await effect.update({changes});
			}
			else {
				ui.notifications.error(`${optionName}: ${version} - no melee damage effect found`);
			}

			// update the resistance
			effect = HomebrewHelpers.findEffect(targetToken.actor, resistanceEffectName);
			if (effect) {
				changes = foundry.utils.duplicate(effect.changes);
				changes[0].value = element;
				await effect.update({changes});
			}
			else {
				ui.notifications.error(`${optionName}: ${version} - no resistance effect found`);
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
