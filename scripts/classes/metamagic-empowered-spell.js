/*
When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of the damage dice up to your Charisma modifier (minimum of one). You must use the new rolls.

You can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.
*/
const version = "11.1";
const optionName = "Empowered Spell";
const cost = 1;

try {
	if (args[0].macroPass === "DamageBonus") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.log(`${optionName} - not enough Sorcery Points left`);
			return {};
		}

		// collect the damage dice details
		const maxRerollDice = Math.max(actor.system.abilities["cha"].mod, 1);
		let rerollDataSet = new Set();
		
		let rows = "";
		for (let t of workflow.damageRoll.terms) {
			let row = `<div class="flexrow"><label>${t.number}d${t.faces}</label></div>`;
			rows += row;
			for (let r of t.results) {
				let dieRow = `<div><input type="checkbox" style="margin-left:25px; margin-right:10px;" value=${r.result}/><label>${r.result}</label></div>`;
				rows += dieRow;
				let dieData = [`d${t.faces}`, r.result, false, `${t.options.flavor}`];
				rerollDataSet.add(dieData);
			}
		}
		let rerollData = Array.from(rerollDataSet);

		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>You can re-roll up to ${maxRerollDice} dice:</label></div>
				<div id="dieRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>
		`;

		// Ask if they want to use it
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: optionName,
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							let spent = 0;
							var grid = document.getElementById("dieRows");
							var checkBoxes = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < checkBoxes.length; i++) {
								if (checkBoxes[i].checked) {
									rerollData[i][2] = true;
									spent += 1;
								}
							}
							
							if (!spent) {
								resolve(false);
							}
							else if (spent > maxRerollDice) {
								ui.notifications.error(`${optionName} - too many dice selected to re-roll`);
								resolve(false);
							}

							resolve(true);
						}
					},
					Cancel:
					{
						label: `Cancel`,
						callback: () => { resolve(false) }
					}
				}
			}).render(true);
		});

		let useFeature = await dialog;
		if (useFeature) {
			await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)

			// perform the re-rolls
			let damageRollTerms = "";
			rerollData.forEach(function (item, index) {
				if (item[2]) {
					let newRoll = (new Roll(item[0]).evaluate({ async: false })).total;
					let damageDiff = (newRoll - Number(item[1]));
					let term = `${damageDiff}[${item[3]}]`;
					if (damageRollTerms.length > 0)
						damageRollTerms += " + ";
					damageRollTerms += term;
				}
			});
			
			// return the damage diff
			return {damageRoll: damageRollTerms, flavor: `${optionName} Damage`};
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
