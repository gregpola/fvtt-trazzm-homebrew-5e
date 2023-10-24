/*
	Immediately after you deal damage to a creature with your Divine Smite feature, you can use your Channel Divinity as
	a bonus action and distribute temporary hit points to creatures of your choice within 30 feet of you, which can
	include you. The total number of temporary hit points equals 2d8 + your level in this class, divided among the chosen
	creatures however you like.
*/
const version = "11.0";
const optionName = "Inspiring Smite"
const channelDivinityName = "Channel Divinity (Paladin)";
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
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
			return false;
		}

		// find nearby allies
		const friendlyTargets = MidiQOL.findNearby(1, token, 30);
		const neutralTargets = MidiQOL.findNearby(0, token, 30);
		let recipients = [token, ...friendlyTargets, ...neutralTargets];
		
		// roll the total temp HP to spend
		const paladinLevel = actor.classes.paladin?.system.levels ?? 0;
		const tempHpRoll = await new Roll(`2d8 + ${paladinLevel}`).evaluate({ async: false });
		await game.dice3d?.showForRoll(tempHpRoll);
		const totalTempHp = tempHpRoll.total;
		
		// ask which ones to heal and how much
		// One row per potential target
		let rows = "";
		for (var i = 0; i < recipients.length; i++) {
			let r = recipients[i];
			let row = `<div class="flexrow"><label>${r.name}</label>` 
				+ `<input id="hp_` + i + `" type="number" min="0" step="1.0" max="${totalTempHp}"></input></div>`;
			rows += row;
		}
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Distribute the ${totalTempHp} temporary hit points available:</label></div>
				<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>`;
		
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${channelDivinityName}: ${optionName}`,
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
							var grid = document.getElementById("targetRows");
							var healFields = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < healFields.length; i++) {
								let rowPoints = Number(healFields[i].value);
								if (rowPoints) {
									spent += rowPoints;
									let recipientIndex = Number(healFields[i].id.substr(healFields[i].id.indexOf('_')+1));
									recoveredData.add([recipientIndex, rowPoints]);
								}
							}
							
							if (!spent) {
								resolve(false);
							}
							else if (spent > totalTempHp) {
								ui.notifications.error(`$${optionName} - too many temp hp assigned`);
								resolve(false);
							}
							else {
								// apply the healing
								for (let rd of recoveredData) {
									let ttoken = recipients[rd[0]];
									let pts = rd[1];
									const damageRoll = await new Roll(`${pts}`).evaluate({ async: false });
									await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "temphp", [ttoken], damageRoll,
										{flavor: `${optionName}`, itemCardId: args[0].itemCardId});
								}
								const newValue = channelDivinity.system.uses.value - cost;
								await channelDivinity.update({"system.uses.value": newValue});
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
	console.error(`${optionName} : ${version}`, err);
}
