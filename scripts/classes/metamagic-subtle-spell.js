/*
	When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.
*/
const version = "11.0";
const optionName = "Metamagic: Subtle Spell";
const baseName = "Font of Magic";
const cost = 1;
const mutationFlag = "subtle-spell-item";

try {
	if (args[0].macroPass === "preItemRoll") {
		let fontOfMagic = actor.items.find(i => i.name === optionName);
		if (fontOfMagic) {
			let usesLeft = fontOfMagic.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough Sorcery Points left`);
				ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
				return false;
			}
		}
		else {
			console.error(`${optionName} - no ${baseName} item on actor`);
			ui.notifications.error(`${optionName} - no ${baseName} item on actor`);
			return false;
		}

		// Check for spells and slots
		// Filter out spells that don't require verbal or somatic
		let spells = actor.items.filter(i => i.type === 'spell' && (i.system.components.somatic || i.system.components.vocal));
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
		//console.log(spell_content);
		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells for their available slots`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <label>Choose the spell to extend: </label>
			  <select name="spell-select">
				${spell_content}
			  </select>
			</div>`;

		new Dialog({
			title: optionName,
			content,
			buttons:
			{
				Ok:
				{
					label: `Ok`,
					callback: async (html) => {
						let itemId = html.find('[name=spell-select]')[0].value;
						let selectedItem = actor.items.get(itemId);
						const itemName = selectedItem.name;
						
						let mutations = {};
						mutations[selectedItem.name] = {
							"system.components.somatic": false,
							"system.components.vocal": false
						};
												
						const updates = {
							embedded: {
								Item: mutations
							}
						};
						
						// mutate the selected item
						await warpgate.mutate(token.document, updates, {}, { name: itemName });
												
						// track target info on the actor
						DAE.setFlag(actor, mutationFlag, {itemName : itemName } );
						await consumeResource(actor, resKey, cost);
					}
				},
				Cancel:
				{
					label: `Cancel`
				}
			}
		}).render(true);

	}
	else if (args[0] === "off") {
		let flag = DAE.getFlag(actor, mutationFlag);
		if (flag) {
			const itemName = flag.itemName;
			let restore = await warpgate.revert(token.document, itemName);
			DAE.unsetFlag(actor, mutationFlag);
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
