/*
	Starting at 2nd level, you can use your Channel Divinity to heal the badly injured.

	As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This feature can restore a creature to no more than half of its hit point maximum. You can’t use this feature on an undead or a construct.
*/
const version = "10.0.0";
const resourceName = "Channel Divinity";
const optionName = "Preserve Life"

try {
	if (args[0].macroPass === "preItemRoll") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${resourceName} - resource pool is empty`);
			return false;
		}
		
		// find nearby allies
		const friendlyTargets = MidiQOL.findNearby(1, actorToken, 30, 0);
		const neutralTargets = MidiQOL.findNearby(0, actorToken, 30, 0);
		let possibleTargets = [actorToken, ...friendlyTargets, ...neutralTargets];
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
										await new MidiQOL.DamageOnlyWorkflow(actor, actorToken, damageRoll.total, "healing", [ttoken], damageRoll, 
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
	let half = (r.actor.system.attributes.hp.max / 2);
	let eligible = ((half > r.actor.system.attributes.hp.value) ? (half - r.actor.system.attributes.hp.value) : 0);
	return eligible > 0;
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
