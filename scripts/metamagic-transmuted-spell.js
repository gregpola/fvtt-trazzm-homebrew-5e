/*
	When you cast a spell that deals a type of damage from the following list, you can spend 1 sorcery point to change that damage type to one of the other listed types: acid, cold, fire, lightning, poison, thunder.
*/
const version = "10.0.0";
const optionName = "Metamagic: Transmuted Spell";
const resourceName = "Sorcery Points";
const elementalTypes = ["acid", "cold", "fire", "lightning", "poison", "thunder"];
const cost = 1;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "postDamageRoll") {
		let itemD = lastArg.item;
				
		// Must be an elemental spell
		if (!["spell"].includes(lastArg.itemData.type))
			return {};
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points || points < cost) {
			ui.notifications.error(`${optionName} - not enough resource points`);
			return false;
		}
				
		// check the damage type
		let itemElementalTypes = new Set();
		let damageParts = itemD.system.damage.parts;
		for (let i = 0; i < damageParts.length; i++) {
			if (elementalTypes.includes(damageParts[i][1])) {
				itemElementalTypes.add(damageParts[i][1]);
			}
		}
		
		if (itemElementalTypes.size === 0) {
			return {};
		}
				
		// Get the manipulation options the actor has
		//let manipulationOptions = new Set();
		
		// ask which type to convert the damage to
		let original_type_content = ``;
		itemElementalTypes.forEach (function(value) {
			if (original_type_content.length > 0)
				original_type_content += ", ";
			original_type_content += value;
		});
		
		let manipulate_content = ``;
		elementalTypes.forEach (function(value) {
			manipulate_content += `<option value=${value}>${value}</option>`;			
		});
		
		let content = `
			<div class="form-group">
			  <p><label>The spell damage type is: ${original_type_content}</label></p>
			  <p><label>Transmute damage to:</label></p>
			  <div style="margin: 10px;">
				  <select name="titem">
					${manipulate_content}
				  </select>
			  </div>
			</div>`;
		

		let d = await new Promise((resolve) => {
			new Dialog({
				title: optionName,
				content,
				buttons: {
					OK: {
						label: "Manipulate", 
						callback: async (html) => {
							let manipName = html.find('[name=titem]')[0].value;
							resolve(manipName);
						}
					},
					Cancel:
					{
						label: `Cancel`,
						callback: async (html) => {
							resolve(null);
						}
					}
				}
			}).render(true);
		});
		let selectedType = await d;
		
		if (selectedType) {
			await consumeResource(actor, resKey, cost);
			
			for (let i = 0; i < lastArg.workflow.damageRoll.terms.length; i++) {
				if (lastArg.workflow.damageRoll.terms[i] instanceof Die) {
					lastArg.workflow.damageRoll.terms[i].options.flavor = selectedType;
				}
			}
			const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(lastArg.workflow.damageRoll.terms);
			await lastArg.workflow.setDamageRoll(newDamageRoll);
			ChatMessage.create({content: itemD.name + " has been manipulated"});
		}
	}
	
} catch (err) {
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
