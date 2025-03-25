/*
	Starting at 6th level, you have honed your defenses against elemental damage. You gain advantage on all saving throws
	against elemental damage types: acid, cold, fire, lightning, and thunder.

	In addition, you can choose one of the elemental damage types and gain resistance to that damage type. This
	resistance remains until you choose a different damage type, after finishing a long rest.
 */
const version = "11.0";
const optionName = "Elemental Resistance";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: 'Choose a damage resistance type',
				content: `
				<form class="flexcol">
				  <div class="form-group">
					<select id="element">
					  <option value="acid">Acid</option>
					  <option value="cold">Cold</option>
					  <option value="fire">Fire</option>
					  <option value="lightning">Lightning</option>
					</select>
				  </div>
				</form>
				`,

				//select element type
				buttons: {
					yes: {
						icon: '<i class="fas fa-bolt"></i>',
						label: 'Select',
						callback: async (html) => {
							let element = html.find('#element').val();
							resolve(element);
						},
					},
				}
			}).render(true);
		});
		let resistType = await dialog;

		if (resistType) {
			let effect =  actor.effects.find(i => i.name === optionName);
			if (effect) {
				effect.delete();
			}

			let effectDataResistance = {
				'label': optionName,
				'icon': workflow.item.img,
				'origin': workflow.item.uuid,
				"duration": {
					"startTime": null,
					"seconds": null,
					"combat": null,
					"rounds": null,
					"turns": null,
					"startRound": null,
					"startTurn": null
				},
				'changes': [
					{
						'key': `system.traits.dr.value`,
						'mode': 2,
						'value': `${resistType}`,
						'priority': 20
					}
				],
				'disabled': false
			};
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectDataResistance]});
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
