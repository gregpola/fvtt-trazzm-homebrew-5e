/*
	When you cast a spell that has a range of 5 feet or greater, you can spend 1 sorcery point to double the range of the spell.

	When you cast a spell that has a range of touch, you can spend 1 sorcery point to make the range of the spell 30 feet.
*/
const version = "12..3.0";
const optionName = "Distant Spell";
const flagName = "distant-spell-item";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.error(`${optionName} - not enough Sorcery Points left`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			return false;
		}

		// Check for spells and slots
		let spells = actor.items.filter(i => i.type === 'spell');
		let spellSlots = actor.system.spells;
		if (!spells || !spellSlots) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells`);
			return false;
		}
		
		const available_spell_slots = Object.values(spellSlots).filter(({value, max}) => {
			return (value > 0 && max > 0);
		});
		
		// ask the character which spell to alter
		spells.sort((a, b)=> {
			if (a.system.level === b.system.level) {
				return a.name < b.name ? -1 : 1;
			} else {
				return a.system.level < b.system.level ? -1 : 1
			}
		});

		let spell_content = ``;
		for (let spell of spells) {
			// check for available slot
			if ((spell.system.level === 0) || (available_spell_slots[spell.system.level-1].value > 0)) {
				spell_content += `<option value=${spell.id}>${spell.name}</option>`;
			}
		}

		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells for their available slots`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <p><label>Choose the spell to make distant: </label></p>
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
			const currentRange = selectedSpell.system.range;

			let newRange = 0;
			let newUnits = currentRange.units;
			if (currentRange.units === "touch") {
				newRange = 30;
				newUnits = "ft";
			}
			else if (currentRange.units === "ft") {
				newRange = currentRange.value * 2;
			}

			// build the modified spell
			let copy_item = foundry.utils.duplicate(selectedSpell);
			copy_item.name = copy_item.name + ` (${optionName})`;
			copy_item.system.range.value = newRange;
			copy_item.system.range.units = newUnits;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);
			await actor.setFlag(_flagGroup, flagName, {id: selectedSpell.id, itemName: itemName, range: currentRange });
			await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)
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
				copy_item.system.range = flag.range;
				await actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
