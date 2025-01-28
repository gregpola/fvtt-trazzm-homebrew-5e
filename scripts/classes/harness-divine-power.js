/*
	You can expend a use of your Channel Divinity to fuel your spells. As a bonus action, you touch your holy symbol,
	utter a prayer, and regain one expended spell slot, the level of which can be no higher than half your proficiency
	bonus (rounded up). The number of times you can use this feature is based on the level you’ve reached in this class:
	2nd level, once; 6th level, twice; and 18th level, thrice. You regain all expended uses when you finish a long rest.
*/
const version = "12.3.0";
const optionName = "Harness Divine Power";

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for expended spell slots
		const pb = actor.system.attributes.prof;
		const maxLevel = Math.ceil(pb / 2);

		for (let [key, {level, value, max}] of Object.entries(actor.system.spells)){
			if (level <= maxLevel && value < max) {
				return true;
			}
		}

		ui.notifications.error(`${optionName} - no missing eligible spell slots`);
		return false;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const pb = actor.system.attributes.prof;
		const maxLevel = Math.ceil(pb / 2);
		const spells = duplicate(actor.system.spells);

		// build the checkbox content
		// loop through each spell level, building a row for each
		let rows = "";

		for (let [key, {level, value, max}] of Object.entries(spells)){
			if (level <= maxLevel && value < max) {
				rows += `<option value=${key}>${key}</option>`;
			}
		}

		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Choose the spell slot to recover:</label></div>
				<p><select name="spellSlots">
					${rows}
				</select></p>
			</div>
		  </form>`;

		let spellSlot = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.spellSlots.value
				}
			},
			window: {
				title: `${optionName}`,
			},
			position: {
				width: 400
			}
		});

		if (spellSlot) {
			let key = 'system.spells.' + spellSlot + '.value';
			let currValue = foundry.utils.getProperty(workflow.actor, key);
			await workflow.actor.update({[key]: currValue + 1});
			await ChatMessage.create({ content: `${actor.name} recovered a spell slot (${spellSlot})` });
		}
	}
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
