/*
	When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum duration of 24 hours.
*/
const version = "12.3.0";
const optionName = "Extended Spell";
const cost = 1;
const flagName = "extended-spell-item";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.error(`${optionName} - not enough Sorcery Points left`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			return false;
		}

		// Check for spells and slots
		// Filter out spells with a duration under 1 minute
		let spells = actor.items.filter(i => i.type === 'spell' && (i.system.duration.units === "minute" || i.system.duration.units === "hour"));
		let spellSlots = actor.system.spells;
		if (!spells || !spellSlots) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName}, has no spells`);
			return false;
		}
		
		const available_spell_slots = Object.values(spellSlots).filter(({value, max}) => {
			return (value > 0 && max > 0);
		});
		
		spells.sort((a, b)=> {
			if (a.system.level === b.system.level) {
				return a.name < b.name ? -1 : 1;
			} else {
				return a.system.level < b.system.level ? -1 : 1
			}
		});

		// ask the character which spell to alter
		let spell_content = ``;
		for (let spell of spells) {
			// check for available slot
			if ((spell.system.level === 0) || (available_spell_slots[spell.system.level-1].value > 0)) {
				spell_content += `<option value=${spell.id}>${spell.name} (${spell.system.duration.value} ${spell.system.duration.units})</option>`;
			}
		}
		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName}, no applicable spells available`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <p><label>Choose the spell to extend: </label></p>
			  <p><select name="spellSelect">
				${spell_content}
			  </select></p>
			</div>`;


		const itemId = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.spellSelect.value;
				}
			},
			window: {
				title: `${optionName}`,
			},
			position: {
				width: 400
			}
		});

		if (itemId) {
			let selectedSpell = actor.items.get(itemId);
			const itemName = selectedSpell.name;
			const currentDuration = selectedSpell.system.duration;

			let newDuration = 0;
			let newUnits = "minute";
			if (currentDuration.units === "minute") {
				newDuration = Math.min(currentDuration.value * 2, 1440);
			}
			else if (currentDuration.units === "hour") {
				newUnits = "hour";
				newDuration = Math.min(currentDuration.value * 2, 24);
			}

			// build the modified spell
			let copy_item = foundry.utils.duplicate(selectedSpell);
			copy_item.name = copy_item.name + ` (${optionName})`;
			copy_item.system.duration.units = newUnits;
			copy_item.system.duration.value = newDuration;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);
			await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)
			await actor.setFlag(_flagGroup, flagName, {id: selectedSpell.id, itemName: itemName, duration: currentDuration });
		}
	}
	else if (args[0] === "off") {
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, flagName);

			let modifiedSpell = actor.items.get(flag.id);
			if (modifiedSpell) {
				let copy_item = foundry.utils.duplicate(modifiedSpell.toObject(false));
				copy_item.name = flag.itemName;
				copy_item.system.duration = flag.duration;
				await actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
