/*
	Starting at 2nd level, you can use your Channel Divinity to heal the badly injured.

	As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to
	five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This
	feature can restore a creature to no more than half of its hit point maximum. You can’t use this feature on an undead
	or a construct.
*/
const version = "11.0";
const optionName = "Preserve Life"
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
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
			return false;
		}

		// find nearby allies
		const friendlyTargets = MidiQOL.findNearby(1, token, 30);
		const neutralTargets = MidiQOL.findNearby(0, token, 30);
		let possibleTargets = [token, ...friendlyTargets, ...neutralTargets];
		const recipients = possibleTargets.filter(filterRecipient);
		
		// roll the total HP to spend
		const clericLevel = actor.classes.cleric?.system.levels ?? 0;
		if (!clericLevel) {
			ui.notifications.error(`${optionName} - caster is not a cleric`);
			return false;
		}
		const totalHealing = 5 * clericLevel;
		
		// ask which ones to heal and how much
		// One row per potential target
		let rows = "";
		for (var i = 0; i < recipients.length; i++) {
			let r = recipients[i];
			// get the max hp per recipient
			let half = Math.ceil(r.actor.system.attributes.hp.max / 2);
			let eligible = ((half > r.actor.system.attributes.hp.value) ? (half - r.actor.system.attributes.hp.value) : 0);
			let recipientMax = Math.min(totalHealing, eligible);
			let row = `<div class="flexrow"><label>${r.name}</label>` 
				+ `<input id="hp_` + i + `" type="number" min="0" step="1.0" max="${recipientMax}"></input>`
				+ `<label>(max: ${recipientMax})</label>`
				+ `</div>`;
			rows += row;
		}
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Distribute the ${totalHealing} healing available:</label></div>
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
							else if (spent > totalHealing) {
								ui.notifications.error(`${channelDivinityName}: ${optionName} - too much healing assigned`);
								resolve(false);
							}
							else {
								// apply the healing
								for (let rd of recoveredData) {
									let ttoken = recipients[rd[0]];
									let pts = rd[1];
									if (pts > 0) {
										const damageRoll = await new Roll(`${pts}`).evaluate({ async: true });
										await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [ttoken], damageRoll,
											{flavor: `${optionName}`, itemCardId: args[0].itemCardId});
									}
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

function filterRecipient(r) {
	let half = (r.actor.system.attributes.hp.max / 2);
	let eligible = ((half > r.actor.system.attributes.hp.value) ? (half - r.actor.system.attributes.hp.value) : 0);
	return eligible > 0;
}
