/*
	Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in
	the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration,
	objects and affected creatures shed dim light in a 10-foot radius.

	Any attack roll against an affected creature or object has advantage if the attacker can see it, and the affected
	creature or object can’t benefit from being invisible.
*/
const version = "12.3.0";
const optionName = "Faerie Fire";

try {
	if (args[0].macroPass === "preActiveEffects") {
		let content = `
            <label><input type="radio" name="choice" value="#5ab9e2" checked>  Blue </label>
            <label><input type="radio" name="choice" value="#55d553">  Green </label>
            <label><input type="radio" name="choice" value="#844ec6">  Purple </label>
        `;

		let color = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.choice.value;
				}
			},
			window: {
				title: `Choose the color of Faerie Fire outline`,
			},
			position: {
				width: 400
			}
		});

		if (color) {
			// update the spell effect to match the color choice
			let spellEffect = macroItem.effects.find(e => e.name === "Faerie Fire");
			if (spellEffect) {
				const changes = foundry.utils.duplicate(spellEffect.changes);
				changes[2].value = color;
				await spellEffect.update({'changes' : changes});
			}
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
