/*
	You can expend a use of your Channel Divinity to fuel your spells. As a bonus action, you touch your holy symbol,
	utter a prayer, and regain one expended spell slot, the level of which can be no higher than half your proficiency
	bonus (rounded up). The number of times you can use this feature is based on the level you’ve reached in this class:
	2nd level, once; 6th level, twice; and 18th level, thrice. You regain all expended uses when you finish a long rest.
*/
const version = "11.0";
const optionName = "Harness Divine Power";
const channelDivinityName = "Channel Divinity (Cleric)";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check Channel Divinity uses available
		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		if (channelDivinity) {
			let usesLeft = channelDivinity.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				return false;
			}
			else {
				const spells = duplicate(actor.system.spells);
				if (!spells) {
					ui.notifications.error(`${optionName} - character has no spells`);
					return false;
				}

				const maxSlotLevel = Math.ceil(actor.system.attributes.prof / 2);

				// build the checkbox content
				// loop through each spell level, building a row for each
				let rows = "";
				for(let [key, {value, max}] of Object.entries(spells)){
					const level = Number(key.at(-1));
					if ((level <= maxSlotLevel) && (value < max)) {
						let row = `
							<div class="flexrow">
								<label>${CONFIG.DND5E.spellLevels[key.at(-1)]}</label>
								<input type="checkbox" style="margin-right:10px;"/>
							</div>`;
						rows += row;
					}
				}

				// build the dialog content
				let content = `<form>
					<div class="flexcol">
						<div class="flexrow" style="margin-bottom: 10px;"><label>You can recover one spell slot</label></div>
						<div id="slotRows" class="flexcol"style="margin-bottom: 10px;">
						${rows}
						</div>
					</div>
		  		</form>`;

				let dialog = new Promise((resolve, reject) => {
					new Dialog({
						title: "Pick which slot to recover",
						content,
						buttons:
							{
								Ok:
									{
										label: `Ok`,
										callback: async (html) => {
											// count the cost of the selections
											let recoveredData = new Set();
											var grid = document.getElementById("slotRows");
											var checkBoxes = grid.getElementsByTagName("INPUT");
											for (var i = 0; i < checkBoxes.length; i++) {
												if (checkBoxes[i].checked) {
													var row = checkBoxes[i].parentNode;
													const l = checkBoxes[i].parentNode.firstElementChild.innerText.charAt(0);
													recoveredData.add(l);
												}
											}

											if (recoveredData.size < 1) {
												resolve(false);
											}
											else if (recoveredData.size > 1) {
												ui.notifications.error(`${optionName} - too many spell slots selected`);
												resolve(false);
											}
											else {
												let slot = recoveredData.first();
												await actor.update({[`system.spells.spell${slot}.value`]: getProperty(actor, `system.spells.spell${slot}.value`) + 1});
												await ChatMessage.create({ content: `${actor.name} recovered a spell slot` });
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
					// expend usage
					const newValue = channelDivinity.system.uses.value - cost;
					await channelDivinity.update({ "system.uses.value": newValue });
					return true;
				}
			}
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
		}

		return false;
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
