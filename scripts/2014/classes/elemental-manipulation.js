/*
	Starting at 2nd level, you have developed a great understanding of the elements and the synergy between them.
	Whenever you cast a spell that produces an elemental effect, you can manipulate the effects of the spell to use one
	of your known elemental substitutions instead of the original element. You learn one element you can use for
	substitution at 2nd level and additional ones at 6th, 10th and 14th level.
 */
const version = "11.1";
const optionName = "Elemental Manipulation";
const elementalTypes = ["acid", "cold", "fire", "lightning"];
try {
	if (args[0].macroPass === "postDamageRoll") {
		// Must be an spell
		if (!["spell"].includes(workflow.item.type)) {
			console.log("Not a spell");
			return;
		}

		// make sure it hit
		if (workflow.hitTargets.size === 0) {
			console.log("Didn't hit");
			return;
		}

		// Must be an elemental damage type
		let itemElementalTypes = new Set();
		let damageParts = workflow.item.system.damage.parts;
		for (let i = 0; i < damageParts.length; i++) {
			if (elementalTypes.includes(damageParts[i][1])) {
				itemElementalTypes.add(damageParts[i][1]);
			}
		}
		
		if (itemElementalTypes.size === 0) {
			return;
		}
				
		// Get the manipulation options the actor has
		let manipulationOptions = new Set();
		let manipulations = actor.items.filter(i => i.name.startsWith(optionName));
		for (let x = 0; x < manipulations.length; x++) {
			for (let y=0; y < elementalTypes.length; y++) {
				if (manipulations[x].name.toLowerCase().includes(elementalTypes[y])) {
					manipulationOptions.add(elementalTypes[y]);
					break;
				}
			}
		}

		if (manipulationOptions.size === 0) {
			return;
		}
		
		// make sure that the only option isn't the same as the spell damageType
		let options = Array.from(manipulationOptions);
		if ((itemElementalTypes.size === 1) && (manipulationOptions.size === 1) && itemElementalTypes.has(options[0])) {
			console.log(`${optionName} - spell has the same damageType as the actors only manipulation`);
			return;
		}
		
		// ask which type to convert the damage to
		let original_type_content = ``;
		itemElementalTypes.forEach (function(value) {
			if (original_type_content.length > 0)
				original_type_content += ", ";
			original_type_content += value;
		});
		
		let manipulate_content = ``;
		manipulationOptions.forEach (function(value) {
			manipulate_content += `<option value=${value}>${value}</option>`;			
		});
		
		let content = `
			<div class="form-group">
			  <label>The spell damage type is: ${original_type_content}</label>
			  <br />
			  <label>Manipulate to:</label>
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
			ChatMessage.create({content: workflow.item.name + " has been manipulated"});
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
