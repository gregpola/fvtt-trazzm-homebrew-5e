/*
	When you cast a spell that targets only one creature and doesn't have a range of self, you can spend a number of
	sorcery points equal to the spell's level to target a second creature in range with the same spell (1 sorcery point
	if the spell is a cantrip).

	To be eligible, a spell must be incapable of targeting more than one creature at the spell's current level. For
	example, Magic Missile and Scorching Ray aren't eligible, but Ray of Frost is.
*/
const version = "11.1";
const optionName = "Twinned Spell";
const flagName = "twinned-spell-item";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const cost = 1;
const exclusionSpells = ["Magic Missile", "Melf's Minute Meteors", "Scorching Ray"];

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.error(`${optionName} - not enough Sorcery Points left`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			return false;
		}

		// Check for spells and slots
		// Filter out non-eligible spells
		let spells = actor.items.filter(i => i.type === 'spell'
			&& !exclusionSpells.includes(i.name)
			&& i.system.target.type === 'creature'
			&& i.system.target.value === 1);
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
				// make sure they have enough Sorcery Points for the spell level
				if (spell.system.level <= usesLeft) {
					spell_content += `<option value=${spell.id}>${spell.name}</option>`;
				}
			}
		}
		//console.log(spell_content);
		if (spell_content.length === 0) {
			ui.notifications.error(`${actor.name} - unable to use ${optionName} because they have no spells for their available slots`);
			return false;
		}

		let content = `
			<div class="form-group">
			  <p><label>Choose the spell to twin: </label></p>
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

						let mutations = {};
						mutations[selectedItem.name] = {
							"system.target.value": 2
						};

						const updates = {
							embedded: {
								Item: mutations
							}
						};

						// mutate the selected item
						await warpgate.mutate(token.document, updates, {}, { name: itemName });

						// track target info on the actor
						await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost);
						await actor.setFlag(_flagGroup, flagName, {itemName : itemName });
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
