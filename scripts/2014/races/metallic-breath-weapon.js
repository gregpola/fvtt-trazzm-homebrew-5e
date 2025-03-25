/*
	At 5th level, you gain a second breath weapon. When you take the Attack action on your turn, you can replace one of
	your attacks with an exhalation in a 15-foot cone.

	The save DC for this breath is 8 + your Constitution modifier + your proficiency bonus.

	Whenever you use this trait, choose one:

		Enervating Breath: Each creature in the cone must succeed on a Constitution saving throw or become incapacitated until the start of your next turn.
		Repulsion Breath: Each creature in the cone must succeed on a Strength saving throw or be pushed 20 feet away from you and be knocked prone.

	Once you use your Metallic Breath Weapon, you can’t do so again until you finish a long rest.
 */
const version = "12.3.0";
const optionName = "Metallic Breath Weapon";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// ask which type of breath
		const content = `
			<p>Which type of breath?</p>
			<label><input type="radio" name="choice" value="enervating" checked>  Enervating Breath </label>
			<label><input type="radio" name="choice" value="repulsion">  Repulsion Breath </label>`;

		let flavor = await foundry.applications.api.DialogV2.prompt({
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

		if (flavor === 'enervating') {
			let enervatingBreath = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Enervating Breath');
			await actor.createEmbeddedDocuments("Item", [enervatingBreath]);
			let actorsItem = actor.items.find(i => i.name === 'Enervating Breath');
			await MidiQOL.completeItemUse(actorsItem, {}, {});
			await HomebrewMacros.wait(500);
			await actor.deleteEmbeddedDocuments('Item', [actorsItem.id]);
		}
		else if (flavor === 'repulsion') {
			let enervatingBreath = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Repulsion Breath');
			await actor.createEmbeddedDocuments("Item", [enervatingBreath]);
			let actorsItem = actor.items.find(i => i.name === 'Repulsion Breath');
			await MidiQOL.completeItemUse(actorsItem, {}, {});
			await HomebrewMacros.wait(500);
			await actor.deleteEmbeddedDocuments('Item', [actorsItem.id]);
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
