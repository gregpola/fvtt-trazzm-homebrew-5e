/*
	Arcane Recovery
	
	You have learned to regain some of your magical energy by studying your spellbook. 
	Once per day when you finish a short rest, you can choose expended spell slots to recover. 
	The spell slots can have a combined level that is equal to or less than half your wizard 
	level (rounded up), and none of the slots can be 6th level or higher.
	
	For example, if you’re a 4th-level wizard, you can recover up to two levels worth of 
	spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.
	
	*/

const version = "10.0.0";
const optionName = "Arcane Recovery";
const lastArg = args[args.length - 1];

try {

	if (args[0].macroPass === "preItemRoll") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		const spells = duplicate(actor.system.spells);
		if (!spells) {
			ui.notifications.error(`${optionName} - character has no spells`);
			return false;
		}
		
		// How many slot points an be recovered
		const wizardLevel = actor.classes?.wizard?.system?.levels ?? 0;
		if (wizardLevel === 0){
			ui.notifications.error(`${optionName} - character is not a Wizard`);
			return false;
		}
		
		const recoveryPoints = Math.ceil(wizardLevel / 2);
		const maxLevel = Math.min(6, recoveryPoints);		
		
		// build the checkbox content
		// loop through each spell level, building a row for each
		let rows = "";
		for(let [key, {value, max}] of Object.entries(spells)){
			const level = Number(key.at(-1));
			if ((level <= maxLevel) && (value < max)) {
				let row = `
					<div class="flexrow">
						<label>${CONFIG.DND5E.spellLevels[key.at(-1)]}</label>`;
				for (let i=value; i < max; i++) {
					row += `<input type="checkbox" style="margin-right:10px;"/>`;
				}
				row += `</div>`;
				rows += row;
			}
		}
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>You can recover ${recoveryPoints} slot levels</label></div>
				<div id="slotRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>
		`;
		
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: "Pick which slots to recover",
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							// count the cost of the selections
							let recoveredData = new Set();
							let spent = 0;
							var grid = document.getElementById("slotRows");
							var checkBoxes = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < checkBoxes.length; i++) {
								if (checkBoxes[i].checked) {
									var row = checkBoxes[i].parentNode;
									const l = checkBoxes[i].parentNode.firstElementChild.innerText.charAt(0);
									recoveredData.add(l);
									spent += Number(l);
								}
							}
							
							if (!spent) {
								resolve(false);
							}
							else if (spent > recoveryPoints) {
								ui.notifications.error(`${optionName} - too many slot levels selected`);
								resolve(false);
							}
							else {
								// recover the slots
								for (let slot of recoveredData) {
									await actor.update({[`system.spells.spell${slot}.value`]: getProperty(actor, `system.spells.spell${slot}.value`) + 1});
								}
								await ChatMessage.create({ content: `${actor.name} recovered ${spent} spell slot levels` });
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
		return(useFeature);
		
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
