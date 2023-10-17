/*
	While this pearl is on your person, you can use an action to speak its command word and regain one expended spell slot of up to 3rd level. Once you use the pearl, it can't be used again until the next dawn.
*/

const version = "10.0.0";
const optionName = "Pearl of Power";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		const spells = duplicate(actor.system.spells);
		if (!spells) {
			ui.notifications.error(`${optionName} - character has no spells`);
			return false;
		}
		
		// make sure they are attuned
		if (lastArg.item.system.attunement < 2) {
			ui.notifications.error(`${optionName} - character is not attuned`);
			return false;
		}

		// Get available slots to recover
		const maxLevel = 3;
		let first = false;
		let second = false;
		let third = false;
		let pact = false;
		
		// build the checkbox content
		// loop through each spell level, building a row for each
		let rows = "";
		for(let [key, {value, max}] of Object.entries(spells)){
			const level = Number(key.at(-1));
			if ((level <= maxLevel) && (value < max)) {
				if (level === 1) first = true;
				if (level === 2) second = true;
				if (level === 3) third = true;
			}
		}
		
		// check the pact slot level
		const pactSlot = spells["pact"];
		pact = ((pactSlot.value < pactSlot.max) && (pactSlot.level < 4));
		
		if (!first && !second && !third && !pact) {
			ui.notifications.error(`${optionName} - character is not missing any applicable spell slots`);
			return false;
		}
		
		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const spells = duplicate(actor.system.spells);

		// Get available slots to recover
		const maxLevel = 3;
		let first = false;
		let second = false;
		let third = false;
		let pact = false;
		
		// build the checkbox content
		// loop through each spell level, building a row for each
		let rows = "";
		for(let [key, {value, max}] of Object.entries(spells)){
			const level = Number(key.at(-1));
			if ((level <= maxLevel) && (value < max)) {
				if (level === 1) first = true;
				if (level === 2) second = true;
				if (level === 3) third = true;
			}
		}
		
		// check the pact slot level
		const pactSlot = spells["pact"];
		pact = ((pactSlot.value < pactSlot.max) && (pactSlot.level < 4));
		
		if (!first && !second && !third && !pact) {
			ui.notifications.error(`${optionName} - character is not missing any 3rd or lower spell slots`);
			return false;
		}
				
		let target_content = ``;
		if (first)
			target_content += `<option value='spell1'>Level 1</option>`;
		if (second)
			target_content += `<option value='spell2'>Level 2</option>`;
		if (third)
			target_content += `<option value='spell3'>Level 3</option>`;
		if (pact)
			target_content += `<option value='pact'>Pact Slot</option>`;

		let content = `
			<div class="form-group">
			  <p>Which slot level do you want to recover?</p>
			  <div style="margin: 10px;">
				  <select name="slotItem">
					${target_content}
				  </select>
			  </div>
			</div>`;

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: optionName,
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							let slotName = html.find('[name=slotItem]')[0].value;
							
							// recover the slots
							const newValue = spells[slotName].value + 1;
							await actor.update({[`system.spells.${slotName}.value`]: newValue});
							await ChatMessage.create({ content: `${actor.name} recovered a spell slot` });
							resolve(true);
						}
					},
					Cancel:
					{
						label: `Cancel`,
						callback: () => { resolve(false) }
					}
				}
			}).render(true);
		});

		let useFeature = await dialog;
		return(useFeature);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
