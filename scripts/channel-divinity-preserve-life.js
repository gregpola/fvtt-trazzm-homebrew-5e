const version = "0.1.0";
const resourceName = "Channel Divinity";
const optionName = "Preserve Life"

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	let token = canvas.tokens.get(args[0].tokenId);
	
	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		const points = tactor.data.data.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName} - resource pool is empty`);
			return false;
		}
		
		// find nearby allies
		const friendlyTargets = MidiQOL.findNearby(1, token, 30, 0);
		const neutralTargets = MidiQOL.findNearby(0, token, 30, 0);
		let possibleTargets = [token, ...friendlyTargets, ...neutralTargets];
		const recipients = possibleTargets.filter(filterRecipient);
		
		// roll the total temp HP to spend
		const clericLevel = actor.classes?.cleric?.data?.data?.levels ?? 0;
		const totalHealing = 5 * clericLevel;
		
		// ask which ones to heal and how much
		// One row per potential target
		let rows = "";
		for (var i = 0; i < recipients.length; i++) {
			let r = recipients[i];
			// get the max hp per recipient
			let half = Math.ceil(r.actor.data.data.attributes.hp.max / 2);
			let eligible = ((half > r.actor.data.data.attributes.hp.value) ? (half - r.actor.data.data.attributes.hp.value) : 0);
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
				title: `${resourceName}: ${optionName}`,
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
								ui.notifications.error(`${resourceName}: ${optionName} - too much healing assigned`);
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
								await consumeResource(actor, resKey, 1);
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
	console.error(`${resourceName}: ${optionName} ${version}`, err);
}

function filterRecipient(r) {
	let half = (r.actor.data.data.attributes.hp.max / 2);
	let eligible = ((half > r.actor.data.data.attributes.hp.value) ? (half - r.actor.data.data.attributes.hp.value) : 0);
	return eligible > 0;
}

// find the resource
function findResource(actor) {
	if (actor) {
		for (let res in actor.data.data.resources) {
			if (actor.data.data.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}
