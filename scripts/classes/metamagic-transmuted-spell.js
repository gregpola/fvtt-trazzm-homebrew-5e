/*
	When you cast a spell that deals a type of damage from the following list, you can spend 1 sorcery point to change
	that damage type to one of the other listed types: acid, cold, fire, lightning, poison, thunder.
*/
const version = "11.0";
const optionName = "Metamagic: Transmuted Spell";
const baseName = "Font of Magic";
const cost = 1;

const elementalTypes = ["acid", "cold", "fire", "lightning", "poison", "thunder"];

try {
	const lastArg = args[args.length - 1];
	if (args[0].macroPass === "postDamageRoll") {
		// Must be an elemental spell
		if (!["spell"].includes(item.type)) {
			return {};
		}
		
		// check resources
		let fontOfMagic = actor.items.find(i => i.name === optionName);
		if (fontOfMagic) {
			let usesLeft = fontOfMagic.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough Sorcery Points left`);
				ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
				return {};
			}
		}
		else {
			console.error(`${optionName} - no ${baseName} item on actor`);
			ui.notifications.error(`${optionName} - no ${baseName} item on actor`);
			return {};
		}

		// check the damage type
		let itemElementalTypes = new Set();
		let damageParts = item.system.damage.parts;
		for (let i = 0; i < damageParts.length; i++) {
			if (elementalTypes.includes(damageParts[i][1])) {
				itemElementalTypes.add(damageParts[i][1]);
			}
		}
		
		if (itemElementalTypes.size === 0) {
			return {};
		}

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
			for (let i = 0; i < workflow.damageRoll.terms.length; i++) {
				if (workflow.damageRoll.terms[i] instanceof Die) {
					workflow.damageRoll.terms[i].options.flavor = selectedType;
				}
			}
			const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(workflow.damageRoll.terms);
			await workflow.setDamageRoll(newDamageRoll);
			ChatMessage.create({content: item.name + " has been transmuted"});
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
