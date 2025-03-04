/*
	When you cast a spell that targets only one creature and doesn't have a range of self, you can spend a number of
	sorcery points equal to the spell's level to target a second creature in range with the same spell (1 sorcery point
	if the spell is a cantrip).

	To be eligible, a spell must be incapable of targeting more than one creature at the spell's current level. For
	example, Magic Missile and Scorching Ray aren't eligible, but Ray of Frost is.
*/
const version = "12.3.0";
const optionName = "Twinned Spell";
const exclusionSpells = ["Magic Missile", "Melf's Minute Meteors", "Scorching Ray"];
const flagName = "twinned-spell-item";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < 1) {
			console.error(`${optionName} - not enough Sorcery Points left`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			return false;
		}

		// Check for spells and slots
		// Filter out non-eligible spells
		let spells = actor.items.filter(i => i.type === 'spell'
			&& i.system.level <= usesLeft
			&& !exclusionSpells.includes(i.name)
			&& i.system.target.value === 1);
		let spellSlots = actor.system.spells;
		if (!spells || !spellSlots) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName}, no applicable spells`);
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
			ui.notifications.error(`${actor.name} - unable to use ${optionName}, no applicable spells for their available slots`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <p><label>Choose the spell to twin: </label></p>
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
			let cost = Math.max(selectedSpell.system.level, 1);

			// build the modified spell
			let copy_item = foundry.utils.duplicate(selectedSpell);
			copy_item.name = copy_item.name + ` (${optionName})`;
			copy_item.system.target.value = 2;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);
			await actor.setFlag(_flagGroup, flagName, {id: selectedSpell.id, itemName: itemName });
			await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost);
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
				copy_item.system.target.value = 1;
				await actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
		}
	}

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
