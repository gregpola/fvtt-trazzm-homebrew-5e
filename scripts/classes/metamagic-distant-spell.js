/*
	When you cast a spell that has a range of 5 feet or greater, you can spend 1 sorcery point to double the range of the spell.

	When you cast a spell that has a range of touch, you can spend 1 sorcery point to make the range of the spell 30 feet.
*/
const version = "11.1";
const optionName = "Distant Spell";
const cost = 1;
const flagName = "distant-spell-item";
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
		//console.log(spell_content);
		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells for their available slots`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <p><label>Choose the spell to make distant: </label></p>
			  <p><select name="spell-select">
				${spell_content}
			  </select></p>
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

						const currentRange = selectedItem.system.range;
						let newRange = 0;
						if (currentRange.units === "touch") {
							newRange = 30;
						}
						else if (currentRange.units === "ft") {
							newRange = currentRange.value * 2;
						}
						
						if (newRange > 0) {
							let mutations = {};
							mutations[selectedItem.name] = {
								"system.range.units": "ft",
								"system.range.range": newRange
							};
													
							const updates = {
								embedded: {
									Item: mutations
								}
							};
							
							// mutate the selected item
							await warpgate.mutate(token.document, updates, {}, { name: itemName });

							// track target info on the actor
							await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)
							await actor.setFlag(_flagGroup, flagName, {itemName : itemName });
						}
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
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, flagName);
			const itemName = flag.itemName;
			await warpgate.revert(token.document, itemName);
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
