/*
	When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.
*/
const version = "12.3.0";
const optionName = "Subtle Spell";
const cost = 1;
const flagName = "subtle-spell-item";
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
		// Filter out spells that don't require verbal or somatic
		let spells = actor.items.filter(i => i.type === 'spell' && (i.system.properties.has('somatic') || i.system.properties.has('vocal')));
		let spellSlots = actor.system.spells;
		if (!spells || !spellSlots) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no applicable spells`);
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
		//console.log(spell_content);
		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells for their available slots`);
			return false;
		}

		let content = `<form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Choose the spell to make subtle:</label></div>
				<div class="flexcol" style="margin-bottom: 10px;">
				  <select name="spellSelect">
					${spell_content}
				  </select>
				</div>
			</div></form>`;

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
			const currentSomatic = selectedSpell.system.properties.has('somatic');
			const currentVocal = selectedSpell.system.properties.has('vocal');

			// build the modified spell
			let copy_item = foundry.utils.duplicate(selectedSpell);
			copy_item.name = copy_item.name + ` (${optionName})`;
			let propSet = new Set();
			copy_item.system.properties.forEach(item => ((item !== 'somatic' && item !== 'vocal') ? propSet.add(item) : null));
			copy_item.system.properties = propSet;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);
			await actor.setFlag(_flagGroup, flagName, {id: selectedSpell.id, itemName: itemName, somatic: currentSomatic, vocal: currentVocal });
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

				if (flag.somatic) {
					copy_item.system.properties.push('somatic');
				}

				if (flag.vocal) {
					copy_item.system.properties.push('vocal');
				}
				await actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
