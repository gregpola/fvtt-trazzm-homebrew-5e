/*
	When you cast a spell that deals a type of damage from the following list, you can spend 1 sorcery point to change
	that damage type to one of the other listed types: acid, cold, fire, lightning, poison, thunder.
*/
const version = "12.3.0";
const optionName = "Transmuted Spell";
const flagName = "transmuted-spell-item";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const cost = 1;

const elementalTypes = ["acid", "cold", "fire", "lightning", "poison", "thunder"];

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.error(`${optionName} - not enough Sorcery Points`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points`);
			return false;
		}

		// Check for spells and slots
		// Filter out spells that don't have the required damage type
		const spells = actor.items.filter(i => (i.type === 'spell') && (i.system.damage.parts.length > 0) && (i.system.damage.parts.map(i=>i[1]).filter(value => elementalTypes.includes(value)).length > 0));
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

		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no applicable spells for their available slots`);
			return false;
		}

		let content = `<form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Choose the spell to transmute:</label></div>
				<div class="flexcol" style="margin-bottom: 10px;">
				  <select name="spellSelect">
					${spell_content}
				  </select>
				</div>
			</div>
		</form>`;

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
			let spellDamageTypes = selectedSpell.system.damage.parts.map(i=>i[1]).filter(value => elementalTypes.includes(value));
			let spellTypes = ``;
			spellDamageTypes.forEach (function(value) {
				spellTypes += `<option value=${value}>${value}</option>`;
			});

			// build element selection
			let elementOptions = ``;
			elementalTypes.forEach (function(value) {
				elementOptions += `<option value=${value}>${value}</option>`;
			});

			let _content = `
			  <form>
				<div class="flexcol">
					<div class="flexrow" style="margin-bottom: 10px;"><label>Spell damage type:</label></div>
					<div class="flexcol" style="margin-bottom: 10px;">
					  <select name="spellTypeSelect">
						${spellTypes}
					  </select>
					</div>
					<div class="flexrow" style="margin-bottom: 10px;"><label>Transmute damage to:</label></div>
					<div class="flexcol" style="margin-bottom: 10px;">
					  <select name="elementalTypesSelect">
						${elementOptions}
					  </select>
					</div>
				</div>
			  </form>`;

			const transmutation = await foundry.applications.api.DialogV2.prompt({
				content: _content,
				rejectClose: false,
				ok: {
					callback: (event, button, dialog) => {
						return [button.form.elements.spellTypeSelect.value, button.form.elements.elementalTypesSelect.value];
					}
				},
				window: {
					title: `${optionName}`,
				},
				position: {
					width: 400
				}
			});

			if (transmutation) {
				const itemName = selectedSpell.name;
				const oldParts = selectedSpell.system.damage.parts;

				let newDamageParts = foundry.utils.duplicate(oldParts);
				for (let i = 0; i < newDamageParts.length; i++) {
					if (newDamageParts[i][1] === transmutation[0]) {
						newDamageParts[i][1] = transmutation[1];
					}
				}

				// build the modified spell
				let copy_item = foundry.utils.duplicate(selectedSpell);
				copy_item.name = copy_item.name + ` (${optionName})`;
				copy_item.system.damage.parts = newDamageParts;
				await actor.updateEmbeddedDocuments("Item", [copy_item]);
				await actor.setFlag(_flagGroup, flagName, {id: selectedSpell.id, itemName: itemName, parts: oldParts });

				await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost);
			}

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
				copy_item.system.damage.parts = flag.parts;
				await actor.updateEmbeddedDocuments("Item", [copy_item]);
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
