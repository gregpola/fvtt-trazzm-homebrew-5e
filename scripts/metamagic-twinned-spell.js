/*
	When you cast a spell that targets only one creature and doesn't have a range of self, you can spend a number of sorcery points equal to the spell's level to target a second creature in range with the same spell (1 sorcery point if the spell is a cantrip).

	To be eligible, a spell must be incapable of targeting more than one creature at the spell's current level. For example, Magic Missile and Scorching Ray aren't eligible, but Ray of Frost is.
*/
const version = "10.0.0";
const optionName = "Metamagic: Twinned Spell";
const resourceName = "Sorcery Points";
const mutationFlag = "twinned-spell-item";
const exclusionSpells = ["Magic Missile", "Melf's Minute Meteors", "Scorching Ray"];

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName} - resource pool is empty`);
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
			  <label>Choose the spell to twin: </label>
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
							"system.target.value": 2
						};
												
						const updates = {
							embedded: {
								Item: mutations
							}
						};
						
						// mutate the selected item
						await warpgate.mutate(actorToken.document, updates, {}, { name: itemName });
												
						// track target info on the actor
						DAE.setFlag(actor, mutationFlag, {itemName : itemName } );
						await consumeResource(actor, resKey, Math.min(selectedItem.system.level, 1));
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
			let restore = await warpgate.revert(actorToken.document, itemName);
			DAE.unsetFlag(actor, mutationFlag);
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
