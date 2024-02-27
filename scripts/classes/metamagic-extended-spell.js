/*
	When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum duration of 24 hours.
*/
const version = "11.1";
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
				spell_content += `<option value=${spell.id}>${spell.name} (${spell.system.duration.value} ${spell.system.duration.units})</option>`;
			}
		}
		//console.log(spell_content);
		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells for their available slots`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <p><label>Choose the spell to extend: </label></p>
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

						const currentDuration = selectedItem.system.duration;
						let newDuration = 0;
						let newUnits = "minute";
						if (currentDuration.units === "minute") {
							newDuration = Math.min(currentDuration.value * 2, 1440);
						}
						else if (currentDuration.units === "hour") {
							newUnits = "hour";
							newDuration = Math.min(currentDuration.value * 2, 24);
						}
						
						if (newDuration > 0) {
							let mutations = {};
							mutations[selectedItem.name] = {
								"system.duration.units": newUnits,
								"system.duration.value": newDuration
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
